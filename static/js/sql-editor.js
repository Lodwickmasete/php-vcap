// SQL Editor JavaScript
let sqlEditor = null;
let isEditorOpen = false;
let editorHeight = 200;
let currentDatabase = 'admin_panel'; // You'll need to set this based on selected database

// Initialize CodeMirror when needed
function initCodeMirror() {
  if (!sqlEditor) {
    sqlEditor = CodeMirror.fromTextArea(document.getElementById('sqlCodeEditor'), {
      mode: 'text/x-sql',
      theme: 'dracula',
      lineNumbers: true,
      lineWrapping: false,
      indentWithTabs: true,
      smartIndent: true,
      matchBrackets: true,
      autofocus: true,
      viewportMargin: Infinity,
      extraKeys: {
        "Ctrl-Enter": function(cm) {
          executeSqlQuery();
        },
        "Cmd-Enter": function(cm) {
          executeSqlQuery();
        },
        "Ctrl-/": function(cm) {
          cm.toggleComment();
        },
        "Ctrl-Space": "autocomplete",
        "Tab": function(cm) {
          if (cm.somethingSelected()) {
            cm.indentSelection("add");
          } else {
            cm.replaceSelection("  ", "end");
          }
        },
        "Shift-Tab": function(cm) {
          cm.indentSelection("subtract");
        }
      }
    });
    
    // Set default query if we have a current table
    if (currentTable) {
      const defaultQuery = `SELECT * FROM ${currentTable} LIMIT 10;`;
      sqlEditor.setValue(defaultQuery);
    }
    
    // Refresh editor display
    setTimeout(() => sqlEditor.refresh(), 100);
  }
}

function toggleSqlEditor() {
  const panel = document.getElementById('sqlEditorPanel');
  const tableWrap = document.querySelector('.table-wrap');
  
  if (!isEditorOpen) {
    // Open editor
    panel.style.display = 'flex';
    panel.style.height = editorHeight + 'px';
    document.body.classList.add('editor-open');
    isEditorOpen = true;
    
    // Initialize CodeMirror
    initCodeMirror();
    
    // Focus editor after a short delay
    setTimeout(() => {
      if (sqlEditor) {
        sqlEditor.focus();
      }
    }, 50);
  } else {
    // Close editor
    panel.style.display = 'none';
    document.body.classList.remove('editor-open');
    isEditorOpen = false;
  }
}

function insertTemplate(type) {
  if (!sqlEditor) return;
  
  const templates = {
    SELECT: `SELECT * FROM ${currentTable || 'your_table'} WHERE id = 1 LIMIT 10;`,
    INSERT: `INSERT INTO ${currentTable || 'your_table'} (username, email, role, status) VALUES ('new_user', 'new@example.com', 'Viewer', 'Active');`,
    UPDATE: `UPDATE ${currentTable || 'your_table'} SET role = 'Editor', status = 'Active' WHERE id = 1;`,
    DELETE: `DELETE FROM ${currentTable || 'your_table'} WHERE id = 1;`
  };
  
  const cursor = sqlEditor.getCursor();
  sqlEditor.replaceRange(templates[type] + '\n', cursor);
  sqlEditor.focus();
}

function clearSqlEditor() {
  if (sqlEditor) {
    sqlEditor.setValue('');
    sqlEditor.focus();
  }
}

async function executeSqlQuery() {
  if (!sqlEditor) return;
  
  const query = sqlEditor.getValue().trim();
  if (!query) {
    showQueryStatus('Error: No SQL query entered', 'info');
    return;
  }
  
  const startTime = performance.now();
  
  // Show executing status
  showQueryStatus('Executing query...', 'info');
  
  try {
    // Determine if it's a SELECT query
    const isSelectQuery = query.toLowerCase().trim().startsWith('select');
    
    // Prepare form data
    const formData = new FormData();
    formData.append('sql', query);
    
    // Add database parameter if available
    const databaseParam = currentDatabase ? `&database=${encodeURIComponent(currentDatabase)}` : 'admin_panel';
    
    // Make API call
    const response = await fetch(`./api/execute-sql.php?${databaseParam}`, {
      method: 'POST',
      body: formData
    });
    
    const resultHTML = await response.text();
    const endTime = performance.now();
    const timeTaken = ((endTime - startTime) / 1000).toFixed(3);
    
    // Determine the message based on result
    let message = '';
    if (resultHTML.includes('alert-success')) {
      // Extract success message from HTML
      const match = resultHTML.match(/alert-success[^>]*>([^<]+)/);
      message = match ? match[1].trim() : `Query executed in ${timeTaken} sec`;
    } else if (resultHTML.includes('table-wrap')) {
      // It's a table result
      const rowsMatch = resultHTML.match(/<tbody>.*?<tr>/g);
      const rowCount = rowsMatch ? rowsMatch.length - 1 : 0; // Subtract header row
      message = `Showing rows 0-${Math.max(0, rowCount-1)} (${rowCount} total, Query took ${timeTaken} sec)`;
      
      // Replace the table content
      const tableContainer = document.querySelector('.table-wrap');
      if (tableContainer) {
        tableContainer.outerHTML = resultHTML;
        
        // Reinitialize table functionality
        initTableCheckboxes();
        bindTableEvents();
      } else {
        // If no table container exists, create one
        document.querySelector('#mainContent').innerHTML = resultHTML;
        initTableCheckboxes();
        bindTableEvents();
      }
      
      // Update status with success
      showQueryStatus(message, 'success', timeTaken);
      return;
    } else if (resultHTML.includes('alert-error')) {
      // Extract error message
      const match = resultHTML.match(/alert-error[^>]*>([^<]+)/);
      message = match ? match[1].trim() : 'Error executing query';
      showQueryStatus(message, 'error');
      return;
    } else {
      message = `Query executed in ${timeTaken} sec`;
    }
    
    // Show the result in a dialog or replace content
    showQueryResult(resultHTML, message, timeTaken);
    
  } catch (error) {
    console.error('SQL execution error:', error);
    showQueryStatus('Error: ' + error.message, 'error');
  }
}

function showQueryResult(html, message, timeTaken) {
  // Create a modal or replace content to show result
  const resultDiv = document.createElement('div');
  resultDiv.className = 'sql-result-modal';
  resultDiv.innerHTML = `
    <div class="sql-result-header">
      <h3>Query Result</h3>
      <span class="close-btn" onclick="this.parentElement.parentElement.remove()">&times;</span>
    </div>
    <div class="sql-result-body">${html}</div>
    <div class="sql-result-footer">
      <div class="query-status success">${message}</div>
    </div>
  `;
  
  // Add styles if not already present
  if (!document.querySelector('#sql-result-styles')) {
    const styles = document.createElement('style');
    styles.id = 'sql-result-styles';
    styles.textContent = `
      .sql-result-modal {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        z-index: 1000;
        max-width: 90%;
        max-height: 80vh;
        display: flex;
        flex-direction: column;
      }
      .sql-result-header {
        padding: 15px 20px;
        border-bottom: 1px solid #ddd;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: #f5f5f5;
        border-radius: 8px 8px 0 0;
      }
      .sql-result-body {
        padding: 20px;
        overflow: auto;
        flex-grow: 1;
      }
      .sql-result-footer {
        padding: 15px 20px;
        border-top: 1px solid #ddd;
        background: #f9f9f9;
        border-radius: 0 0 8px 8px;
      }
      .close-btn {
        cursor: pointer;
        font-size: 24px;
        line-height: 1;
      }
    `;
    document.head.appendChild(styles);
  }
  
  // Add backdrop
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.5);
    z-index: 999;
  `;
  backdrop.onclick = () => {
    backdrop.remove();
    resultDiv.remove();
  };
  
  document.body.appendChild(backdrop);
  document.body.appendChild(resultDiv);
  
  // Show status in toolbar as well
  showQueryStatus(message, 'success', timeTaken);
}

// Helper function to show query status (you already have this)
function showQueryStatus(message, type, time = null) {
  // Your existing showQueryStatus implementation
  const statusElement = document.querySelector('.query-status');
  if (statusElement) {
    statusElement.textContent = message;
    statusElement.className = `query-status ${type}`;
    if (time !== null) {
      statusElement.textContent += ` (${time}s)`;
    }
  }
}

// Resize functionality
document.getElementById('sqlEditorResize').addEventListener('mousedown', initResize);

function initResize(e) {
  e.preventDefault();
  const panel = document.getElementById('sqlEditorPanel');
  const startY = e.clientY;
  const startHeight = parseInt(getComputedStyle(panel).height);
  
  function doResize(e) {
    const newHeight = startHeight + (startY - e.clientY);
    if (newHeight > 100 && newHeight < 500) {
      editorHeight = newHeight;
      panel.style.height = newHeight + 'px';
      updateTableHeight(newHeight);
    }
  }
  
  function stopResize() {
    document.removeEventListener('mousemove', doResize);
    document.removeEventListener('mouseup', stopResize);
  }
  
  document.addEventListener('mousemove', doResize);
  document.addEventListener('mouseup', stopResize);
}

function updateTableHeight(height) {
  document.documentElement.style.setProperty('--editor-height', height + 'px');
}

// Initialize CSS variable
document.documentElement.style.setProperty('--editor-height', '200px');

// Update your SQL button in toolbar
document.addEventListener('DOMContentLoaded', function() {
  const sqlBtn = document.querySelector('button[title="SQL"]');
  if (sqlBtn) {
    sqlBtn.onclick = toggleSqlEditor;
  }
  
  // Set current database based on your app state
  // This should be updated when user selects a database
  currentDatabase = getCurrentDatabase(); // You need to implement this
});

// Keyboard shortcut to toggle editor (Alt+S)
document.addEventListener('keydown', function(e) {
  if (e.altKey && e.key === 's') {
    e.preventDefault();
    toggleSqlEditor();
  }
});

// Helper functions you need to implement or adjust
function getCurrentDatabase() {
  // Return the currently selected database
  // This depends on how your app manages state
  return document.querySelector('.database-selector')?.value || '';
}

function initTableCheckboxes() {
  // Reinitialize checkbox functionality for new table
  const selectAll = document.getElementById('selectAll');
  const checkboxes = document.querySelectorAll('.row-checkbox');
  
  if (selectAll) {
    selectAll.onclick = function() {
      checkboxes.forEach(cb => cb.checked = this.checked);
    };
  }
  
  checkboxes.forEach(cb => {
    cb.onclick = function() {
      if (!this.checked) {
        selectAll.checked = false;
      }
    };
  });
}

function bindTableEvents() {
  // Rebind double-click events for inline editing
  const editableCells = document.querySelectorAll('[ondblclick^="editCell"]');
  editableCells.forEach(cell => {
    cell.ondblclick = function() {
      editCell(this);
    };
  });
}



// Replace the existing drag code with this:

const panel = document.getElementById('sqlEditorPanel');
const resizeHandle = document.getElementById('sqlEditorResize');

let isDragging = false;
let startY = 0;
let startHeight = 0;

function startDrag(y) {
  isDragging = true;
  startY = y;
  startHeight = parseInt(getComputedStyle(panel).height, 10);
  document.body.style.cursor = 'ns-resize';
  document.body.style.userSelect = 'none';
}

function doDrag(y) {
  if (!isDragging) return;
  
  const delta = y - startY; // Changed to y - startY for natural dragging
  let newHeight = startHeight - delta; // Subtract instead of add
  
  // Apply limits (min: 150px, max: 80% of viewport)
  const minHeight = 150;
  const maxHeight = window.innerHeight * 0.8;
  newHeight = Math.max(minHeight, Math.min(newHeight, maxHeight));
  
  panel.style.height = newHeight + 'px';
  
  // Update the table height dynamically
  updateTableHeight(newHeight);
}

function stopDrag() {
  isDragging = false;
  document.body.style.cursor = '';
  document.body.style.userSelect = '';
}

function updateTableHeight(editorHeight) {
  const tableWrap = document.querySelector('.table-wrap');
  if (tableWrap) {
    const availableHeight = window.innerHeight - 42 - editorHeight; // Adjust 42px for header
    tableWrap.style.height = Math.max(200, availableHeight) + 'px';
  }
}

// Mouse events
resizeHandle.addEventListener('mousedown', e => {
  e.preventDefault();
  startDrag(e.clientY);
});

document.addEventListener('mousemove', e => {
  if (!isDragging) return;
  e.preventDefault();
  doDrag(e.clientY);
});

document.addEventListener('mouseup', e => {
  if (!isDragging) return;
  e.preventDefault();
  stopDrag();
});

// Touch events
resizeHandle.addEventListener('touchstart', e => {
  e.preventDefault();
  startDrag(e.touches[0].clientY);
});

document.addEventListener('touchmove', e => {
  if (!isDragging) return;
  e.preventDefault();
  doDrag(e.touches[0].clientY);
});

document.addEventListener('touchend', e => {
  if (!isDragging) return;
  e.preventDefault();
  stopDrag();
});

// Prevent default touch behavior
resizeHandle.addEventListener('touchmove', e => e.preventDefault(), { passive: false });