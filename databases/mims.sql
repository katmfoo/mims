-- MySQL dump 10.13  Distrib 5.7.21, for osx10.13 (x86_64)
--
-- Host: ec2-54-81-254-121.compute-1.amazonaws.com    Database: mims
-- ------------------------------------------------------
-- Server version	5.7.25-0ubuntu0.18.04.2

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `businesses`
--

DROP TABLE IF EXISTS `businesses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `businesses` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(45) NOT NULL,
  `updated_datetime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `creation_datetime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `businesses`
--

LOCK TABLES `businesses` WRITE;
/*!40000 ALTER TABLE `businesses` DISABLE KEYS */;
INSERT INTO `businesses` VALUES (1,'Target','2019-03-08 17:40:46','2019-02-18 03:33:54');
/*!40000 ALTER TABLE `businesses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_types`
--

DROP TABLE IF EXISTS `user_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_types` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(45) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_types`
--

LOCK TABLES `user_types` WRITE;
/*!40000 ALTER TABLE `user_types` DISABLE KEYS */;
INSERT INTO `user_types` VALUES (1,'Manager'),(2,'Employee');
/*!40000 ALTER TABLE `user_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(45) NOT NULL,
  `password_hash` varchar(256) NOT NULL,
  `first_name` varchar(45) DEFAULT NULL,
  `last_name` varchar(45) DEFAULT NULL,
  `type` int(11) NOT NULL,
  `business` int(11) NOT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0',
  `updated_datetime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `creation_datetime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username_UNIQUE` (`username`),
  KEY `fk_users_user_types_idx` (`type`),
  KEY `fk_users_businesses_idx` (`business`),
  CONSTRAINT `fk_users_businesses` FOREIGN KEY (`business`) REFERENCES `businesses` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_users_user_types` FOREIGN KEY (`type`) REFERENCES `user_types` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Manager1','$argon2i$v=19$m=102400,t=2,p=8$prSW8r63lrL2vleKMYZQSg$Va04vr/zzt0Ge/zpCuU+Aw','John','Smith',1,1,0,'2019-04-04 19:58:09','2019-02-18 03:39:24'),(2,'sallygreene3','$argon2i$v=19$m=102400,t=2,p=8$7R1jbE2pVYrxvpfyHsO41w$aINQgRf9YrKKwE8ax+fOOw','Sally','Greenington',2,1,0,'2019-04-04 19:26:49','2019-02-21 20:50:48'),(13,'codycody','$argon2i$v=19$m=102400,t=2,p=8$3xsjREhJiZGSMibk/J+TMg$+dQhPSaA1AIl5APjGjlUMg','Cody','Killroy',1,1,0,'2019-04-01 13:44:34','2019-03-08 20:05:41'),(14,'jdoe1234','$argon2i$v=19$m=102400,t=2,p=8$9z6nNKZ0DgFASIkRwhhDSA$1kJ0ZdB1ngw2x8Q9dMdTyw','Jake','Doe',1,1,1,'2019-04-04 19:54:12','2019-03-27 23:17:56'),(15,'jappleseed5','$argon2i$v=19$m=102400,t=2,p=8$ao3R2tsbwzjHGMPYG0MI4Q$F7u5n61pxSko+DgHEsLFiw','Johnny','Appleseed',2,1,1,'2019-04-04 19:53:54','2019-03-27 23:31:25'),(16,'ahoushmand0','$argon2i$v=19$m=102400,t=2,p=8$1xqjNCaEcO7dW0sJAeD8fw$p0GssG5ASA5RcXRqFsgdxw','Ali','Houshmand',1,1,1,'2019-04-04 19:58:18','2019-03-27 23:38:23'),(17,'alovelace1','$argon2i$v=19$m=102400,t=2,p=8$E2JsTSmFEAJgDIHQes/5nw$3WTDNAWwtlVD+Q7HVmThbw','Ada','Lovelace',1,1,0,'2019-03-27 23:54:55','2019-03-27 23:54:55'),(18,'cdefghij','$argon2i$v=19$m=102400,t=2,p=8$fW/tPaeUEmKsNQbg/B+DMA$OZ4Ac+7kvsDzRcSgya6z8g','a','b',2,1,1,'2019-04-01 13:58:29','2019-03-27 23:56:33'),(19,'etwo22222','$argon2i$v=19$m=102400,t=2,p=8$3/s/Z4xRKoXwvtd6L6U05g$2sJHWuHt/nKV/Ie7gtJ4SA','Employee','Two',2,1,1,'2019-04-01 13:58:39','2019-03-28 00:00:59'),(20,'sagarikak','$argon2i$v=19$m=102400,t=2,p=8$+J/zvjdGKCVkbG1NqZXyvg$0s+oxi0FVXPKMZ+rdFRU8Q','Sagarika','Kumar',1,1,0,'2019-03-28 19:51:31','2019-03-28 19:51:31'),(21,'newuser1','$argon2i$v=19$m=102400,t=2,p=8$z3nv/d8bQwhBCAHgPCckJA$3mB0ez8etXFJqxdMhYimVg','New ','User',2,1,1,'2019-04-04 19:58:04','2019-03-28 19:53:11'),(22,'newuser2','$argon2i$v=19$m=102400,t=2,p=8$cu6dU2pN6T3nHOOcM6YU4g$KWCAbL6s+8PCJkC9cnDP6A','Dominic','Buttermilk',2,1,0,'2019-04-04 19:42:07','2019-03-28 19:53:59'),(23,'bbobson5','$argon2i$v=19$m=102400,t=2,p=8$am3tXWuNkbK2Nqa0NiYE4A$jA9yylovTJnVDxViC+ihuw','Bob','Bobson',2,1,0,'2019-03-28 20:18:57','2019-03-28 20:18:57'),(24,'bbobson6','$argon2i$v=19$m=102400,t=2,p=8$YIzReo9RKiVkLAUgRGjNmQ$Ecob5H1DtMbVFfdTy10eYg','Bob','Bobson',1,1,0,'2019-03-28 20:19:58','2019-03-28 20:19:58'),(25,'sbob555555','$argon2i$v=19$m=102400,t=2,p=8$x/gf49xbyxlj7D1nTInx/g$tKEvUECr0JKptNCtpLq8dw','Sponge','Bob',2,1,1,'2019-04-04 19:58:10','2019-03-28 20:23:03'),(26,'jdoe098765','$argon2i$v=19$m=102400,t=2,p=8$YAxhjNEaY4wxhjAGYMxZSw$nN0R2FVfcn74O7ZNsvkcPA','John','Doe',2,1,0,'2019-03-28 20:23:51','2019-03-28 20:23:51'),(27,'testuser1','$argon2i$v=19$m=102400,t=2,p=8$pzRGqFVKaW1NifHeu1dKqQ$HVipgK22NK+1vpxswrWipQ','Test','User',1,1,1,'2019-04-04 19:55:25','2019-03-29 00:39:36'),(28,'testuser2','$argon2i$v=19$m=102400,t=2,p=8$l3Ju7d37P8c45/xfqxXifA$B94pfW7bVJdGZOlYodlqig','Test','User',2,1,1,'2019-04-04 19:55:22','2019-03-29 00:41:45'),(29,'Newuser5','$argon2i$v=19$m=102400,t=2,p=8$PqeUUqrV2psz5txba43R+g$GzqBEsfjZN3LbNV3H/FLdA','New','User',2,1,1,'2019-04-04 19:55:20','2019-03-31 03:38:43'),(30,'pricheal','$argon2i$v=19$m=102400,t=2,p=8$TkmplVJq7T2HcI5Ryvmfkw$6j5F9eOev7FRXzipc3hYdQ','Patrick','Richeal',1,1,1,'2019-04-01 14:39:09','2019-04-01 13:28:12'),(31,'newmanman','$argon2i$v=19$m=102400,t=2,p=8$xHivdW5NSUmJUUoJ4fxfiw$1RymKeQ7oqamsSANP1NCyw','New','Man',1,1,1,'2019-04-04 19:55:23','2019-04-01 13:45:43'),(32,'patricknewuser','$argon2i$v=19$m=102400,t=2,p=8$rLV2bo1RqtXa2zuHMGYM4Q$a2XdaS5XURhrvPG8WQYC6A','Patrick','NewUser',1,1,1,'2019-04-04 19:58:12','2019-04-01 14:39:02'),(33,'DMarandino','$argon2i$v=19$m=102400,t=2,p=8$EQIAIARAqHUOQSgFYAwBgA$2aSJIu8yIRK5n1rfCJ1H0g','Dipme','Inbuttermilk',1,1,1,'2019-04-02 17:39:42','2019-04-02 17:17:54'),(34,'pstar002','$argon2i$v=19$m=102400,t=2,p=8$AmBs7b03htBaa83ZWyvFmA$qVgnAKlcDlUBNmvEh1MBvQ','Patrick','Star',2,1,0,'2019-04-04 19:56:34','2019-04-04 19:56:34'),(35,'newguy22','$argon2i$v=19$m=102400,t=2,p=8$GOOcs7Z2jhGiFELoXWvN+Q$8a9n1bOCijhXrWdn9c2N3Q','New','Guy',2,1,0,'2019-04-04 19:58:33','2019-04-04 19:58:33'),(36,'hijack12','$argon2i$v=19$m=102400,t=2,p=8$GaNUaq3Vuvdei/FeKyUEYA$FMra3sNIXc3TQBWdi8Q5yA','hi','jack',1,1,1,'2019-04-04 20:02:09','2019-04-04 19:59:17'),(37,'PolioPaul','$argon2i$v=19$m=102400,t=2,p=8$WItRyplzTinFWEsJAcCYMw$nQmBAjggOx2huv9B0Hw7iw','Polio','Paul',1,1,0,'2019-04-09 16:41:57','2019-04-09 16:41:57');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2019-04-10 11:16:01
