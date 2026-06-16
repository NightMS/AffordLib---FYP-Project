-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: fyp_library
-- ------------------------------------------------------
-- Server version	8.0.42

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
-- Table structure for table `adminuser`
--

DROP TABLE IF EXISTS `adminuser`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `adminuser` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `IsAdmin` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `adminuser`
--

LOCK TABLES `adminuser` WRITE;
/*!40000 ALTER TABLE `adminuser` DISABLE KEYS */;
INSERT INTO `adminuser` VALUES (1,'admin','admin@affordlib.com','$2b$10$diWiWa0Q/S7UsAhOWrurR.BA7DLyn9JVqhat1jj6sAZoh.tWokNU2','2025-07-14 03:11:28',1),(2,'admintest','admintest@affordlib.com','$2b$10$Ij8TrYkFahFeJs5Jr.DuqOmQ5Q7ki4oU1C5k90yFp8VNXSB9142OS','2025-07-15 06:17:38',1),(3,'admin21','admin2@affordlib.com','$2b$10$uJfxFngxYRyvMLZWaH.qk.AJ4qOXdn5MIhAkB48rPEUKlk0kdZL.C','2025-07-15 06:19:21',1),(4,'best admin','badmin@gmail.com','$2b$10$FRr6NP.cJtTTfXBWwQHonOQ8ePfqLWFBSjtWtldZlTankX8d4OL2O','2025-07-21 02:14:26',1);
/*!40000 ALTER TABLE `adminuser` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `article_tags`
--

DROP TABLE IF EXISTS `article_tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `article_tags` (
  `article_id` int NOT NULL,
  `tag_id` int NOT NULL,
  PRIMARY KEY (`article_id`,`tag_id`),
  KEY `tag_id` (`tag_id`),
  CONSTRAINT `article_tags_ibfk_1` FOREIGN KEY (`article_id`) REFERENCES `journal_articles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `article_tags_ibfk_2` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `article_tags`
--

LOCK TABLES `article_tags` WRITE;
/*!40000 ALTER TABLE `article_tags` DISABLE KEYS */;
INSERT INTO `article_tags` VALUES (1,1),(5,1),(2,3),(5,3),(6,3),(7,3),(8,3),(10,3),(8,4),(9,4),(10,4),(10,5);
/*!40000 ALTER TABLE `article_tags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comments`
--

DROP TABLE IF EXISTS `comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `article_id` int NOT NULL,
  `comment` text NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `article_id` (`article_id`),
  CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`article_id`) REFERENCES `journal_articles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comments`
--

LOCK TABLES `comments` WRITE;
/*!40000 ALTER TABLE `comments` DISABLE KEYS */;
INSERT INTO `comments` VALUES (2,12,1,'very good keep it on\r\n\r\n','2025-07-17 10:06:59'),(3,14,8,'good good','2025-07-21 01:00:33'),(4,14,9,'I rate this article 5/5 even though I haven\'t read it. Thumbs up =D','2025-07-21 01:53:45'),(5,15,10,'I added this one fr','2025-07-21 02:20:06');
/*!40000 ALTER TABLE `comments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `journal_articles`
--

DROP TABLE IF EXISTS `journal_articles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `journal_articles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `author` varchar(255) NOT NULL,
  `tags` text,
  `abstract` mediumtext,
  `file_path` varchar(255) DEFAULT NULL,
  `uploaded_by` int DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `article_publish_time` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `visibility` enum('public','private') DEFAULT 'public',
  PRIMARY KEY (`id`),
  KEY `uploaded_by` (`uploaded_by`),
  CONSTRAINT `journal_articles_ibfk_1` FOREIGN KEY (`uploaded_by`) REFERENCES `adminuser` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `journal_articles`
--

LOCK TABLES `journal_articles` WRITE;
/*!40000 ALTER TABLE `journal_articles` DISABLE KEYS */;
INSERT INTO `journal_articles` VALUES (1,'Mitigating Risks in Artifical Intelligence Language Models: Strategies for Responsible Deployment','Velibor Božić , Indrasen Poola',NULL,'Artifical Intelligence (AI) language models, such as ChatGPT, have shown\r\nimpressive capabilities, but they also raise concerns about bias, ethical issues, and potential\r\nmisuse. This paper explores ways to mitigate risks associated with AI language models by\r\naddressing challenges such as bias reduction, user feedback, context-awareness, and\r\ntransparency. Fine-tuning, customization, and controlled generation are proposed as\r\nstrategies to enhance model performance while maintaining relevance and safety.\r\nAdditionally, domain restrictions, user consent, and compliance with regulations are\r\ndiscussed to ensure responsible deployment. By implementing these mitigation strategies, AI\r\nlanguage models can become valuable tools while safeguarding against harmful\r\nconsequences and preserving ethical standards.','1752748902026-ChatGPThypeandlimitations.pdf',NULL,'2025-07-17 01:05:31','1996-10-21 00:00:00',NULL,'public'),(2,'(private) Mitigating Risks in Artifical Intelligence Language Models: Strategies for Responsible Deployment','Velibor Božić , Indrasen Poola',NULL,'Artifical Intelligence (AI) language models, such as ChatGPT, have shown\r\nimpressive capabilities, but they also raise concerns about bias, ethical issues, and potential\r\nmisuse. This paper explores ways to mitigate risks associated with AI language models by\r\naddressing challenges such as bias reduction, user feedback, context-awareness, and\r\ntransparency. Fine-tuning, customization, and controlled generation are proposed as\r\nstrategies to enhance model performance while maintaining relevance and safety.\r\nAdditionally, domain restrictions, user consent, and compliance with regulations are\r\ndiscussed to ensure responsible deployment. By implementing these mitigation strategies, AI\r\nlanguage models can become valuable tools while safeguarding against harmful\r\nconsequences and preserving ethical standards.','1752758015145-ChatGPThypeandlimitations.pdf',NULL,'2025-07-17 01:08:42','2025-07-16 00:00:00',NULL,'private'),(5,'test5','test5',NULL,'test5','1752686856989-ChatGPThypeandlimitations.pdf',NULL,'2025-07-17 01:27:37','2025-07-10 00:00:00',NULL,'public'),(6,'Futureproofing the SA Health Library Service:   a transformative approach ','SA Health Library Service Management Team',NULL,'In recent years, the SA Health Library Service has undergone significant change \r\nwithin our workforce. We have faced a situation familiar to many in the library sector, \r\nwith a substantial portion of our staff reaching retirement age simultaneously. As of \r\n2024, following an extensive recruitment effort, most of our management team and \r\nover half of our reference librarian team have been in their current roles for less than \r\ntwo years. ','1752758090824-Futureproofing_the_SA_Health_Library_Service_a_tra.pdf',NULL,'2025-07-17 21:14:51','2022-07-17 00:00:00',NULL,'public'),(7,'Benefits of QR Codes in Libraries: Enhancing  Accessibility, Engagement, and Efficiency','Abla Ibrahim',NULL,'QR codes have become a transformative tool for libraries, enhancing \r\naccessibility, engagement, and operational efficiency. By bridging physical \r\nand digital resources, QR codes enable patrons to access e-books, \r\naudiobooks, and multimedia content instantly. They support multilingual \r\naccess and provide inclusive solutions for patrons with disabilities, ensuring \r\nequitable access to information. QR codes also foster interactive learning \r\nexperiences, gamification, and personalized recommendations, deepening \r\npatron engagement with library resources. Operationally, QR codes \r\nstreamline processes such as self-service checkouts, inventory management, \r\nand event registration, reducing staff workload and improving efficiency. This \r\npaper explores the benefits of QR codes in libraries, supported by graphic \r\ndesigns that illustrate their integration into library environments. By adopting \r\nQR codes, libraries can modernize their services, reach diverse audiences, \r\nand remain relevant in the digital age. This research highlights the potential \r\nof QR codes to support libraries in their mission to provide access to \r\nknowledge, foster community engagement, and promote lifelong learning. ','1752758140727-BenefitsofQRCodesinLibraries.pdf',NULL,'2025-07-17 21:15:40','2024-08-06 00:00:00',NULL,'private'),(8,'English Language Education in Kashmir: A Diachronic Study','Firdous Nazir\'s Lab',NULL,'Kashmiri students are acquiring English as their tertiary language. Urdu is the second language in Kashmir, whereas Kashmiri is the primary language. The children of Kashmir exhibit superior English proficiency compared to pupils from other Indian states. Although English is the third language introduced at their educational institutions, this situation persists. One explanation is that English is imparted to pupils at the pre-primary level at an earlier age. Furthermore, it presently serves as the medium of teaching in educational institutions. This category encompasses both government and private entities. Before the emergence of English, most textbooks published in languages other than English were written in Urdu. Nonetheless, English has now assumed the function of Urdu. It is the preeminent educational system in the region. Government schools have always regarded the grammar-translation method as an excellent pedagogical instrument over the years. The project garnered support from publishers who provided reference volumes with Urdu translations. This paper examines the history and evolution of English in the Kashmir Valley. Since its establishment in missionary schools, it has permeated other public and private educational institutions. English was introduced to Kashmiris via CMC during the period of British dominion in and around the Indian subcontinent. The paper discusses how English developed to become the predominant language of teaching. Technology illustrates the impact it has exerted on indigenous languages and cultures.','1753059502656-179-182FirdousNazir1.pdf',NULL,'2025-07-21 08:58:22','2025-03-21 00:00:00',NULL,'public'),(9,'The Variant Use of Verb in Pakistani English Newspapers: A Corpus-Based Study','Danish',NULL,'The present study deals with the variable use of verb in Pakistani English. It describes the verbs in Pakistani English that are similar to Standard British English semantically but vary at lexical level. It is a qualitative descriptive study which intends to identify the lexical choices of PE speakers/ writers. Two corpora: BNC and PENC have been used in present study to identify and describe those verbs qualitatively and for studying nativization and variation in these verbs. While using the corpus of newspaper, the present study anticipates to recognize the lexical choices of Pakistani people which contribute in making Pakistani English a distinct variety. It also aims to ascertain the pragmatic aspects of Pakistani English that contribute to bring lexical changes in it.','1753062683301-TheVariantUseofVerbinPakistaniEnglishNewspapersACorpus-BasedStudy1.pdf',NULL,'2025-07-21 09:51:23','2024-11-21 00:00:00',NULL,'public'),(10,'1 Understanding Philosophical Media: From Philosophy of Technology to “Technologies of Philosophy”','Giacomo Pezzano1',NULL,'In this paper, we introduce the issue of the “technologies of philosophy” into the philosophy of technology discourse. To this end, we rework some assumptions in the contemporary philosophy of technology, particularly postphenomenology, building on the idea that technology is essential to human existence. In Sect. 1, we outline three core roles technology plays in the human lifeform: technological support, mediation and constitution. In Sect. 2, we highlight the importance of extending this model from bodily to cognitive technologies, drawing on recent approaches that advocate for this perspective. In Sect. 3, we propose to apply this framework to philosophical reflection itself, emphasizing the medial oblivion that has affected philosophical self-analysis and how it may foster implicit or explicit forms of technological determinism—particularly concerning the role of alphabetic writing. To address this neglect and counteract the deterministic tendency, we submit a classification of the technologies of philosophy, examining them from both a descriptive (Sect. 4) and a (moderately) normative (Sect. 5) standpoint. Descriptively, we suggest that not only words but also images, the body and things can be considered philosophical media proper. Normatively, we argue that digital technologies, which are nowadays deeply influencing our modes of knowledge production and transmission, challenge the idea that writing is the sole suitable medium for philosophical work, prompting a reconsideration of how philosophy could be done. Thus, our aim is to advocate for a more diverse, potentially “post-alphabetic” view of philosophy in the digital age, one that seeks to explore how engaging with various technologies could lead to new insights into the nature of philosophy itself.','1753064258367-Understanding_Philosophical_Media_From_Philosophy_.pdf',NULL,'2025-07-21 10:17:38','2025-07-22 00:00:00',NULL,'public');
/*!40000 ALTER TABLE `journal_articles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ratings`
--

DROP TABLE IF EXISTS `ratings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ratings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `article_id` int NOT NULL,
  `rating` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`,`article_id`),
  KEY `article_id` (`article_id`),
  CONSTRAINT `ratings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `ratings_ibfk_2` FOREIGN KEY (`article_id`) REFERENCES `journal_articles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `ratings_chk_1` CHECK ((`rating` between 1 and 5))
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ratings`
--

LOCK TABLES `ratings` WRITE;
/*!40000 ALTER TABLE `ratings` DISABLE KEYS */;
INSERT INTO `ratings` VALUES (1,12,1,5,'2025-07-17 09:45:23'),(2,14,8,1,'2025-07-21 01:00:37'),(3,14,9,5,'2025-07-21 01:53:14'),(4,14,1,3,'2025-07-21 01:55:23'),(6,15,10,3,'2025-07-21 02:20:19'),(8,12,8,4,'2025-07-22 15:47:07');
/*!40000 ALTER TABLE `ratings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tags`
--

DROP TABLE IF EXISTS `tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tags` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tags`
--

LOCK TABLES `tags` WRITE;
/*!40000 ALTER TABLE `tags` DISABLE KEYS */;
INSERT INTO `tags` VALUES (1,'Artifical Intelligent'),(3,'Library'),(4,'english'),(5,'Technology'),(6,'Lecture');
/*!40000 ALTER TABLE `tags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','user') DEFAULT 'user',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `subscription` enum('subscribe','not subscribe') NOT NULL DEFAULT 'not subscribe',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'night1','test@hotmail.com','$2b$10$GFJV3c9CGcMHg8FUBxo6E.TwN7AYx0VWxGgZ53D6jsSECo8SsXkXW','user','2025-07-08 04:21:29','subscribe'),(6,'test','testuser@gmail.com','$2b$10$OcPJe5Gsax4AdY9qm9v2JurbWoBnRzKixN3pJe3SDwhvovT3IajJC','user','2025-07-11 18:32:54','subscribe'),(8,'test123','testuser1@gmail.com','$2b$10$AsHAt7z5.MeWEDucF.IEnu.cEVnncvRtkt8zS48er/aWoOusm0fMi','user','2025-07-11 18:37:51','not subscribe'),(9,'test2','testuser2@gmail.com','$2b$10$a05K11wooc/lZawY8NDMWu3/voeZ4CAfArnpTfJPDDE177oLxkX.u','user','2025-07-11 18:40:29','not subscribe'),(10,'Customer','customer1@affordlib.com','$2b$10$AP/0RgosD8jIy.j5scuToev96mqquAxNzPR8F0gAKPpJ9UZHBQ.AK','user','2025-07-15 03:54:42','subscribe'),(11,'test12','test@affordlib.com','$2b$10$lgsArckFYFk29eqJUNmQKOMUzwv2RlJGvmSDbssYHOjQDn9VLJpDK','user','2025-07-15 03:56:43','not subscribe'),(12,'Customer1','customer@affordlib.com','$2b$10$5FdpDrAshOTKabtebhcvgeQUwX1sVm60nAIn3ERYWkzLvF6.kmKUS','user','2025-07-17 07:24:37','subscribe'),(13,'customer2','customer2@affordlib.com','$2b$10$MHYr29gaBeY3WhbUBKIaw.AoaZg00qQ.gxqIsvEY1FbwgZN/Y7EMW','user','2025-07-17 09:54:15','not subscribe'),(14,'nbrosm','nbrosm@gmail.com','$2b$10$Du0P0sp2HBPDg0/t8driS.nXyGHom.qO983WJemdQKO9xu8xQTaW2','user','2025-07-21 00:54:41','not subscribe'),(15,'sultan','sultan@gmail.com','$2b$10$uQ2X6lC4bM8nwlIXA1lMn.SJa8RNyI7gHIGQbkyFvClPjvGAccLtK','user','2025-07-21 02:18:36','subscribe');
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

-- Dump completed on 2025-07-23 11:32:16
