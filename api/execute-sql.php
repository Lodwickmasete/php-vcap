<?php
// Database Configuration
define('DB_HOST', '0.0.0.0');
define('DB_USER', 'root');
define('DB_PASS', 'root');
define('DB_CHARSET', 'utf8mb4');

// Set headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: text/html; charset=utf-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

function connectToDatabase($database = null) {
    try {
        $dsn = "mysql:host=" . DB_HOST . ";charset=" . DB_CHARSET;
        if ($database) {
            $dsn .= ";dbname=" . $database;
        }
        
        $conn = new PDO($dsn, DB_USER, DB_PASS);
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        
        return $conn;
    } catch (PDOException $e) {
        return ['error' => 'Connection failed: ' . $e->getMessage()];
    }
}

function executeSQL($conn, $sql, $params = []) {
    try {
        // Check if it's a SELECT query
        $isSelect = stripos(trim($sql), 'SELECT') === 0;
        
        if ($isSelect) {
            $stmt = $conn->prepare($sql);
            $stmt->execute($params);
            $data = $stmt->fetchAll();
            
            // Get column names
            $columns = [];
            if (!empty($data)) {
                $columns = array_keys($data[0]);
            } else {
                // For empty results, try to get column info from query
                $stmt = $conn->prepare($sql . " LIMIT 0");
                $stmt->execute($params);
                $columnCount = $stmt->columnCount();
                for ($i = 0; $i < $columnCount; $i++) {
                    $meta = $stmt->getColumnMeta($i);
                    $columns[] = $meta['name'];
                }
            }
            
            return [
                'type' => 'SELECT',
                'data' => $data,
                'columns' => $columns,
                'rowCount' => $stmt->rowCount()
            ];
        } else {
            // INSERT, UPDATE, DELETE
            $stmt = $conn->prepare($sql);
            $stmt->execute($params);
            
            return [
                'type' => 'WRITE',
                'rowCount' => $stmt->rowCount(),
                'lastInsertId' => $conn->lastInsertId()
            ];
        }
    } catch (PDOException $e) {
        return ['error' => 'SQL Error: ' . $e->getMessage()];
    }
}

function generateHTMLTable($result) {
    if (isset($result['error']) || !isset($result['data'])) {
        return '<div class="alert alert-error">' . ($result['error'] ?? 'No data returned') . '</div>';
    }
    
    $columns = $result['columns'];
    $data = $result['data'];
    
    $html = '<div class="table-wrap">';
    $html .= '<table class="db-table" id="dataTable">';
    $html .= '<thead><tr>';
    
    // Add checkbox column header
    $html .= '<th><input type="checkbox" id="selectAll"></th>';
    
    // Add column headers
    foreach ($columns as $column) {
        $html .= '<th>' . htmlspecialchars($column) . '</th>';
    }
    $html .= '</tr></thead>';
    
    // Add table body
    $html .= '<tbody id="tableBody">';
    
    if (empty($data)) {
        $html .= '<tr><td colspan="' . (count($columns) + 1) . '">No rows found</td></tr>';
    } else {
        $rowNum = 1;
        foreach ($data as $row) {
            $html .= '<tr>';
            $html .= '<td><input type="checkbox" class="row-checkbox"></td>';
            
            foreach ($row as $cell) {
                // Check if cell is null or empty
                $isNull = ($cell === null || $cell === 'NULL');
                $cellValue = $cell ?? '';
                
                // Determine cell type based on column name and value
                $isNumeric = is_numeric($cellValue);
                $isBoolean = $cellValue === '0' || $cellValue === '1' || $cellValue === 0 || $cellValue === 1;
                $isDate = false;
                $isEmail = false;
                
                // Only check for date patterns if cell is not null/empty
                if (!$isNull && $cellValue !== '') {
                    $isDate = preg_match('/^\d{4}-\d{2}-\d{2}/', $cellValue) || 
                             preg_match('/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/', $cellValue);
                    $isEmail = filter_var($cellValue, FILTER_VALIDATE_EMAIL);
                }
                
                $dataAttrs = '';
                $cellContent = $isNull ? 'NULL' : htmlspecialchars($cellValue);
                $cssClass = $isNull ? ' class="text-muted"' : '';
                
                // Add appropriate data attributes for inline editing
                if (!$isNull && $cellValue !== '') {
                    if (stripos($column, 'email') !== false) {
                        $dataAttrs = 'ondblclick="editCell(this)" data-type="email"';
                    } elseif (stripos($column, 'status') !== false) {
                        $dataAttrs = 'ondblclick="editCell(this)" data-type="enum" data-options="Active,Inactive,Pending,Suspended"';
                    } elseif (stripos($column, 'role') !== false) {
                        $dataAttrs = 'ondblclick="editCell(this)" data-type="enum" data-options="Owner,Admin,Editor,Viewer,Guest"';
                    } elseif ($isBoolean) {
                        $dataAttrs = 'ondblclick="editCell(this)" data-type="boolean"';
                    } elseif ($isNumeric && stripos($column, 'age') !== false) {
                        $dataAttrs = 'ondblclick="editCell(this)" data-type="number" data-min="18" data-max="100"';
                    } elseif ($isNumeric) {
                        $dataAttrs = 'ondblclick="editCell(this)" data-type="number"';
                    } elseif ($isDate) {
                        $dataAttrs = ''; // Dates are not editable by default
                    } else {
                        $dataAttrs = 'ondblclick="editCell(this)" data-type="string" data-maxlength="50"';
                    }
                }
                
                $html .= "<td$cssClass $dataAttrs>$cellContent</td>";
            }
            $html .= '</tr>';
            $rowNum++;
        }
    }
    
    $html .= '</tbody></table></div>';
    return $html;
}

// Main execution
try {
    $database = 'admin_panel'; //$_GET['database'] ?? ''; for testing
    $sql = $_POST['sql'] ?? ($_GET['sql'] ?? '');
    
    if (empty($sql)) {
        echo '<div class="alert alert-warning">No SQL query provided</div>';
        exit();
    }
    
    // Connect to database
    $conn = connectToDatabase($database);
    if (is_array($conn) && isset($conn['error'])) {
        echo '<div class="alert alert-error">' . $conn['error'] . '</div>';
        exit();
    }
    
    // Execute SQL
    $result = executeSQL($conn, $sql);
    
    if (isset($result['error'])) {
        echo '<div class="alert alert-error">' . $result['error'] . '</div>';
    } elseif ($result['type'] === 'SELECT') {
        echo generateHTMLTable($result);
    } else {
        // For write operations, show success message
        $message = "Query OK, " . $result['rowCount'] . " row(s) affected";
        if (isset($result['lastInsertId']) && $result['lastInsertId']) {
            $message .= ". Last insert ID: " . $result['lastInsertId'];
        }
        echo '<div class="alert alert-success">' . $message . '</div>';
    }
    
} catch (Exception $e) {
    echo '<div class="alert alert-error">Error: ' . htmlspecialchars($e->getMessage()) . '</div>';
}