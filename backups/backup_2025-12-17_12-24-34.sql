-- mysqldump-php https://github.com/ifsnop/mysqldump-php
--
-- Host: 0.0.0.0	Database: admin_panel
-- ------------------------------------------------------
-- Server version 	10.4.6-MariaDB
-- Date: Wed, 17 Dec 2025 12:24:34 +0000

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40101 SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `departments`
--

DROP TABLE IF EXISTS `departments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `departments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `departments`
--

LOCK TABLES `departments` WRITE;
/*!40000 ALTER TABLE `departments` DISABLE KEYS */;
SET autocommit=0;
INSERT INTO `departments` VALUES (1,'Administration','System administrators and owners','2025-12-17 11:12:08'),(2,'Content','Editors and content managers','2025-12-17 11:12:08'),(3,'Support','Viewers and support staff','2025-12-17 11:12:08'),(4,'Guests','Guest users with limited access','2025-12-17 11:12:08');
/*!40000 ALTER TABLE `departments` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;

-- Dumped table `departments` with 4 row(s)
--

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `role` enum('Owner','Admin','Editor','Viewer','Guest') NOT NULL DEFAULT 'Guest',
  `status` enum('Active','Inactive','Pending','Suspended') NOT NULL DEFAULT 'Pending',
  `age` int(11) DEFAULT NULL CHECK (`age` >= 18 and `age` <= 100),
  `last_login` datetime DEFAULT NULL,
  `verified` tinyint(1) DEFAULT 0,
  `created_date` date NOT NULL DEFAULT curdate(),
  `department_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  KEY `department_id` (`department_id`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
SET autocommit=0;
INSERT INTO `users` VALUES (1,'admin','admin@site.com','Owner','Active',NULL,NULL,1,'2024-10-01',1),(2,'lodwick','lodwick@mail.com','Admin','Active',30,'2024-12-11 18:32:10',1,'2024-10-12',1),(3,'jane_doe','jane@example.com','Editor','Pending',25,NULL,0,'2024-10-15',2),(4,'john_smith','john@example.com','Viewer','Suspended',40,'2024-12-01 09:11:44',0,'2024-10-18',3),(5,'guest_user',NULL,'Guest','Suspended',NULL,NULL,NULL,'2024-11-02',4),(6,'alice_wonder','alice@wonderland.com','Editor','Active',28,'2024-12-10 14:20:30',1,'2024-11-05',2),(7,'bob_builder','bob@builder.com','Viewer','Active',35,'2024-12-09 10:15:45',1,'2024-11-10',3),(8,'charlie_chaplin','charlie@chaplin.com','Guest','Inactive',45,'2024-11-25 16:40:22',0,'2024-11-15',4),(9,'diana_prince','diana@themyscira.com','Admin','Active',32,'2024-12-11 09:30:15',1,'2024-11-20',1),(10,'edward_scissor','edward@scissors.com','Editor','Pending',29,NULL,0,'2024-11-25',2),(11,'new_user','new@example.com','Viewer','Active',NULL,NULL,0,'2025-12-17',NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;

-- Dumped table `users` with 11 row(s)
--

--
-- Table structure for table `user_logs`
--

DROP TABLE IF EXISTS `user_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `action` varchar(50) NOT NULL,
  `details` text DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `user_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_logs`
--

LOCK TABLES `user_logs` WRITE;
/*!40000 ALTER TABLE `user_logs` DISABLE KEYS */;
SET autocommit=0;
INSERT INTO `user_logs` VALUES (1,1,'LOGIN','User logged in successfully','192.168.1.100','2025-12-17 11:12:08'),(2,1,'PROFILE_UPDATE','Updated email settings','192.168.1.100','2025-12-17 11:12:08'),(3,2,'LOGIN','User logged in','192.168.1.101','2025-12-17 11:12:08'),(4,2,'PASSWORD_CHANGE','Changed password','192.168.1.101','2025-12-17 11:12:08'),(5,3,'REGISTRATION','New user registered','192.168.1.102','2025-12-17 11:12:08'),(6,4,'ACCOUNT_SUSPENDED','Account suspended for violation','192.168.1.103','2025-12-17 11:12:08');
/*!40000 ALTER TABLE `user_logs` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;

-- Dumped table `user_logs` with 6 row(s)
--

--
-- Table structure for table `user_settings`
--

DROP TABLE IF EXISTS `user_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `theme` varchar(20) DEFAULT 'light',
  `notifications_enabled` tinyint(1) DEFAULT 1,
  `email_notifications` tinyint(1) DEFAULT 1,
  `two_factor_auth` tinyint(1) DEFAULT 0,
  `language` varchar(10) DEFAULT 'en',
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `user_settings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_settings`
--

LOCK TABLES `user_settings` WRITE;
/*!40000 ALTER TABLE `user_settings` DISABLE KEYS */;
SET autocommit=0;
INSERT INTO `user_settings` VALUES (1,1,'dark',1,1,1,'en'),(2,2,'light',1,1,0,'en'),(3,3,'light',0,1,0,'fr'),(4,4,'dark',1,0,0,'en'),(5,5,'light',0,0,0,'es');
/*!40000 ALTER TABLE `user_settings` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;

-- Dumped table `user_settings` with 5 row(s)
--

/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;
/*!40101 SET AUTOCOMMIT=@OLD_AUTOCOMMIT */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on: Wed, 17 Dec 2025 12:24:34 +0000
