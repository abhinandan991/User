CREATE DATABASE  IF NOT EXISTS `innodb` /*!40100 DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci */;
USE `innodb`;
-- MySQL dump 10.13  Distrib 8.0.34, for Win64 (x86_64)
--
-- Host: database-1.ciohjacrdv4d.us-east-1.rds.amazonaws.com    Database: innodb
-- ------------------------------------------------------
-- Server version	5.5.5-10.6.14-MariaDB-log

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `Accounts`
--

DROP TABLE IF EXISTS `Accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Accounts` (
  `account_id` varchar(255) NOT NULL,
  `active_since` timestamp NOT NULL DEFAULT current_timestamp(),
  `address_line_1` varchar(255) DEFAULT NULL,
  `address_line_2` varchar(255) DEFAULT NULL,
  `city` varchar(255) DEFAULT NULL,
  `zipcode` varchar(255) DEFAULT NULL,
  `state` varchar(255) DEFAULT NULL,
  `country` varchar(255) DEFAULT NULL,
  `company_name` varchar(255) DEFAULT NULL,
  `balance` int(11) DEFAULT 0,
  `balance_uninvoiced` varchar(255) DEFAULT NULL,
  `first_name` varchar(255) DEFAULT NULL,
  `last_name` varchar(255) DEFAULT NULL,
  `verified` int(11) NOT NULL DEFAULT 0,
  `type` varchar(45) DEFAULT 'free',
  PRIMARY KEY (`account_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `KafkaClusters`
--

DROP TABLE IF EXISTS `KafkaClusters`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `KafkaClusters` (
  `id` varchar(255) NOT NULL,
  `cluster_label` varchar(255) NOT NULL,
  `user_id` varchar(255) NOT NULL,
  `account_id` varchar(255) NOT NULL,
  `created` timestamp NOT NULL DEFAULT current_timestamp(),
  `cloud_provider` varchar(255) NOT NULL,
  `number_of_instances` int(11) NOT NULL,
  `size` varchar(255) NOT NULL,
  `cluster_type` varchar(255) NOT NULL,
  `region` varchar(255) NOT NULL,
  `status` varchar(255) NOT NULL,
  `whitelisted_ip` varchar(255) DEFAULT NULL,
  `ready_for_connections` int(11) NOT NULL DEFAULT 0,
  `username` varchar(255) DEFAULT 'N/A',
  `password` varchar(255) DEFAULT 'N/A',
  `tier` varchar(45) DEFAULT 'trial',
  PRIMARY KEY (`id`),
  UNIQUE KEY `cluster_label` (`cluster_label`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Nodes`
--

DROP TABLE IF EXISTS `Nodes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Nodes` (
  `id` varchar(255) NOT NULL,
  `cluster_uuid` varchar(255) NOT NULL,
  `ip_address` varchar(255) NOT NULL,
  `node_status` varchar(255) NOT NULL,
  `type` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `cluster_uuid` (`cluster_uuid`),
  CONSTRAINT `Nodes_ibfk_1` FOREIGN KEY (`cluster_uuid`) REFERENCES `KafkaClusters` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Users`
--

DROP TABLE IF EXISTS `Users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Users` (
  `user_id` varchar(255) NOT NULL,
  `account_id` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `user_type` varchar(255) NOT NULL DEFAULT 'add_on',
  `email` varchar(200) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `password_reset` int(11) DEFAULT 0,
  `phone_verify` int(11) DEFAULT 0,
  `password` varchar(255) DEFAULT NULL,
  `profile_image` varchar(255) DEFAULT 'https://w7.pngwing.com/pngs/178/595/png-transparent-user-profile-computer-icons-login-user-avatars.png',
  `access` varchar(255) DEFAULT 'limited',
  `act_token` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `phone` (`phone`),
  KEY `account_id` (`account_id`),
  CONSTRAINT `Users_ibfk_1` FOREIGN KEY (`account_id`) REFERENCES `Accounts` (`account_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-01-29 20:08:25
