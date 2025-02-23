-- CREATE TABLE userTBL
-- (
--  userID INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
--  email VARCHAR(255) NOT NULL UNIQUE,
--  pw VARCHAR(255),
--  token TEXT,
--  joinDate DATE NOT NULL,
--  nickName VARCHAR(255) NOT NULL UNIQUE,
--  profilePicture TEXT,
--  location VARCHAR(255),
--  isAuth TINYINT(1) UNSIGNED NOT NULL DEFAULT 0,
--  kakaoID INT UNSIGNED UNIQUE
-- )
-- CREATE TABLE petTBL
-- (
--  petID INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
--  ownerID INT UNSIGNED NOT NULL,
--  name VARCHAR(20) NOT NULL,
--  birthDate DATE NOT NULL,
--  photo TEXT,
--  level TINYINT UNSIGNED NOT NULL DEFAULT 1,
--  gender VARCHAR(2) NOT NULL,
--  weight float(5,2),
--  UNIQUE KEY (ownerID, name),
--  FOREIGN KEY (ownerID) REFERENCES userTBL(userID) ON UPDATE CASCADE ON DELETE CASCADE
-- );
-- CREATE TABLE walkInforTBL
-- (
--  petID INT UNSIGNED NOT NULL UNIQUE,
--  walkNum TINYINT UNSIGNED NOT NULL,
--  walkMinute SMALLINT UNSIGNED NOT NULL,
--  FOREIGN KEY (petID) REFERENCES petTBL(petID) ON UPDATE CASCADE ON DELETE CASCADE
-- );
-- CREATE TABLE diseaseInforTBL
-- (
--  petID INT UNSIGNED NOT NULL,
--  diseaseName VARCHAR(20) NOT NULL,
--  UNIQUE KEY (petID, diseaseName),
--  FOREIGN KEY (petID) REFERENCES petTBL(petID) ON UPDATE CASCADE ON DELETE CASCADE
-- );
-- CREATE TABLE petSpeciesTBL
-- (
--  petSpeciesID INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
--  petSpeciesName VARCHAR(20) NOT NULL UNIQUE
-- );
-- CREATE TABLE pet_petSpeciesTBL
-- (
--  petID INT UNSIGNED NOT NULL,
--  petSpeciesID INT UNSIGNED NOT NULL,
--  UNIQUE KEY (petID, petSpeciesID),
--  FOREIGN KEY (petID) REFERENCES petTBL(petID) ON UPDATE CASCADE ON DELETE CASCADE,
--  FOREIGN KEY (petSpeciesID) REFERENCES petSpeciesTBL(petSpeciesID) ON UPDATE CASCADE ON DELETE CASCADE
-- );
-- CREATE TABLE medicinePreTBL
-- (
--  medicinePreID INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
--  petID INT UNSIGNED NOT NULL,
--  medicineName VARCHAR(30) NOT NULL,
--  medicineExplan VARCHAR(255),
--  cycleUnit TINYINT(1) NOT NULL,
--  oneDayNum TINYINT UNSIGNED NOT NULL DEFAULT 1,
--  FOREIGN KEY (petID) REFERENCES petTBL(petID) ON UPDATE CASCADE ON DELETE CASCADE
-- );
-- CREATE TABLE medicinePreWeekTBL
-- (
--  medicinePreID INT UNSIGNED NOT NULL,
--  dayOfWeek VARCHAR(1) NOT NULL,
--  UNIQUE KEY (medicinePreID, dayOfWeek),
--  FOREIGN KEY (medicinePreID) REFERENCES medicinePreTBL(medicinePreID) ON UPDATE CASCADE ON DELETE CASCADE
-- );
-- CREATE TABLE medicinePreDayTBL
-- (
--  medicinePreID INT UNSIGNED NOT NULL UNIQUE,
--  startDate DATE NOT NULL,
--  cycleDayNum TINYINT UNSIGNED NOT NULL,
--  FOREIGN KEY (medicinePreID) REFERENCES medicinePreTBL(medicinePreID) ON UPDATE CASCADE ON DELETE CASCADE
-- );
-- CREATE TABLE medicinePreTimeTBL
-- (
--  medicinePreID INT UNSIGNED NOT NULL,
--  takeTime TIME NOT NULL,
--  UNIQUE KEY (medicinePreID, takeTime),
--  FOREIGN KEY (medicinePreID) REFERENCES medicinePreTBL(medicinePreID) ON UPDATE CASCADE ON DELETE CASCADE
-- );
-- CREATE TABLE medicineDiaryTBL
-- (
--  medicineDiaryID INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
--  petID INT UNSIGNED NOT NULL,
--  cycleDay TINYINT UNSIGNED,
--  medicine VARCHAR(45) NOT NULL UNIQUE,
--  memo VARCHAR(255),
--  FOREIGN KEY (petID) REFERENCES petTBL(petID) ON UPDATE CASCADE ON DELETE CASCADE
-- );
-- CREATE TABLE diaryTBL
-- (
--  diaryID INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
--  petID INT UNSIGNED NOT NULL,
--  diaryDate DATE NOT NULL,
--  title VARCHAR(50) NOT NULL DEFAULT "무제",
--  picture TEXT,
--  texts TEXT NOT NULL,
--  shareIs TINYINT(1) NOT NULL DEFAULT 0,
--  petState VARCHAR(30) NOT NULL,
--  weather VARCHAR(30) NOT NULL,
--  albumPick TINYINT(1) NOT NULL DEFAULT 0,
--  color VARCHAR(30) NOT NULL,
--  font VARCHAR(30) NOT NULL,
--  UNIQUE KEY (petID, diaryDate),
--  FOREIGN KEY (petID) REFERENCES petTBL(petID) ON UPDATE CASCADE ON DELETE CASCADE
-- );
-- CREATE TABLE diary_hashTagTBL
-- (
--  diaryID INT UNSIGNED NOT NULL,
--  hashTagName VARCHAR(30) NOT NULL,
--  UNIQUE KEY (diaryID, hashTagName),
--  FOREIGN KEY (diaryID) REFERENCES diaryTBL(diaryID) ON UPDATE CASCADE ON DELETE CASCADE
-- );
-- CREATE TABLE walkDiaryTBL
-- (
--  walkDiaryID INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
--  petID INT UNSIGNED NOT NULL,
--  walkDate DATE NOT NULL,
--  walkStartTime TIME NOT NULL,
--  walkEndTime TIME NOT NULL,
--  totalTime TIME NOT NULL,
--  UNIQUE KEY (petID, walkDate, walkStartTime, walkEndTime),
--  CONSTRAINT start_end_time CHECK ( walkStartTime < walkEndTime),
--  FOREIGN KEY (petID) REFERENCES petTBL(petID) ON UPDATE CASCADE ON DELETE CASCADE
-- );
-- CREATE TABLE mealInforTBL
-- (
--  mealInforID INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
--  petID INT UNSIGNED NOT NULL UNIQUE,
--  oneDayMealNum TINYINT UNSIGNED NOT NULL,
--  mealAmount float(3,1) NOT NULL,
--  memo VARCHAR(255),
--  FOREIGN KEY (petID) REFERENCES petTBL(petID) ON UPDATE CASCADE ON DELETE CASCADE
-- );
-- CREATE TABLE snackInforTBL
-- (
--  snackInforID INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
--  petID INT UNSIGNED NOT NULL UNIQUE,
--  oneDaySnackNum TINYINT UNSIGNED NOT NULL,
--  snackAmount float(3,1) NOT NULL,
--  memo VARCHAR(255),
--  FOREIGN KEY (petID) REFERENCES petTBL(petID) ON UPDATE CASCADE ON DELETE CASCADE
-- );
-- CREATE TABLE showerDiaryTBL
-- (
--  showerDiaryID INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
--  petID INT UNSIGNED NOT NULL UNIQUE,
--  cycleDay TINYINT UNSIGNED NOT NULL,
--  dueDate DATE,
--  lastDate DATE,
--  FOREIGN KEY (petID) REFERENCES petTBL(petID) ON UPDATE CASCADE ON DELETE CASCADE
-- );
-- CREATE TABLE beautyDiaryTBL
-- (
--  beautyDiaryID INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
--  petID INT UNSIGNED NOT NULL UNIQUE,
--  cycleDay TINYINT UNSIGNED NOT NULL,
--  dueDate DATE,
--  lastDate DATE,
--  salon VARCHAR(45),
--  FOREIGN KEY (petID) REFERENCES petTBL(petID) ON UPDATE CASCADE ON DELETE CASCADE
-- );
-- CREATE TABLE hospitalDiaryTBL
-- (
--  hospitalDiaryID INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
--  petID INT UNSIGNED NOT NULL,
--  hospitalName VARCHAR(20) NOT NULL,
--  visitDate DATE NOT NULL,
--  cost INT UNSIGNED,
--  memo VARCHAR(255),
--  FOREIGN KEY (petID) REFERENCES petTBL(petID) ON UPDATE CASCADE ON DELETE CASCADE
-- );
-- 삭제!!
-- CREATE TABLE hospitalReservationTBL
-- (
--  hospitalReservationID INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
--  hospitalDiaryID INT UNSIGNED NOT NULL UNIQUE,
--  reservationDate DATE NOT NULL,
--  memo VARCHAR(1000),
--  visitIs TINYINT(1) NOT NULL DEFAULT 0,
--  FOREIGN KEY (hospitalDiaryID) REFERENCES hospitalDiaryTBL(hospitalDiaryID) ON UPDATE CASCADE ON DELETE CASCADE
-- );
-- CREATE TABLE todoListKeywordTBL
-- (
--  todoListKeywordID INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
--  keyword VARCHAR(20) NOT NULL UNIQUE
-- );
-- CREATE TABLE todoListTBL
-- (
--  todoListID INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
--  petID INT UNSIGNED NOT NULL,
--  date DATE NOT NULL,
--  content VARCHAR(255) NOT NULL,
--  isCheck TINYINT(1) UNSIGNED NOT NULL DEFAULT 0,
--  time TINYINT UNSIGNED,
--  todoListKeywordID INT UNSIGNED NOT NULL,
--  FOREIGN KEY (petID) REFERENCES petTBL(petID) ON UPDATE CASCADE ON DELETE CASCADE,
--  FOREIGN KEY (todoListKeywordID) REFERENCES todoListKeywordTBL(todoListKeywordID) ON UPDATE CASCADE ON DELETE CASCADE
-- );
-- CREATE TABLE usermail_authstringTBL
-- (
--  userEmail varchar(255) NOT NULL UNIQUE,
--  authString VARCHAR(15) NOT NULL,
--  FOREIGN KEY (userEmail) REFERENCES userTBL(email) ON UPDATE CASCADE ON DELETE CASCADE
-- );
-- CREATE TABLE usermailupdate_authstringTBL
-- (
--  userID INT UNSIGNED NOT NULL UNIQUE,
--  authString VARCHAR(15) NOT NULL,
--  updateEmail VARCHAR(255) NOT NULL UNIQUE,
--  FOREIGN KEY (userID) REFERENCES userTBL(userID) ON UPDATE CASCADE ON DELETE CASCADE
-- );