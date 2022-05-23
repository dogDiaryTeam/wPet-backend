-- DELIMITER //
-- CREATE TRIGGER check_medicinepre_cycle_unit
-- 	AFTER UPDATE
--     ON medicinepretbl FOR EACH ROW
-- BEGIN
--     IF OLD.cycleUnit != NEW.cycleUnit THEN
-- 		IF NEW.cycleUnit = 1 THEN
-- 			DELETE FROM medicinepredaytbl WHERE medicinepredaytbl.medicinePreID=NEW.medicinePreID;
-- 		ELSE
-- 			DELETE FROM medicinepreweektbl WHERE medicinepreweektbl.medicinePreID=NEW.medicinePreID;
-- 		END IF;
-- 	END IF;
-- END// 
-- DELIMITER ;


-- DELIMITER //
-- CREATE TRIGGER check_walk_diary_total_time
-- 	BEFORE INSERT
--     ON walkdiarytbl FOR EACH ROW
-- BEGIN
-- 	SET NEW.totalTime = timediff(NEW.walkEndTime,NEW.walkStartTime);
-- END// 
-- DELIMITER ;


-- DELIMITER //
-- CREATE TRIGGER check_walk_diary_total_time_update
-- 	BEFORE UPDATE
--     ON walkdiarytbl FOR EACH ROW
-- BEGIN
-- 	IF OLD.walkStartTime != NEW.walkStartTime or OLD.walkEndTime != NEW.walkEndTime THEN
-- 		SET NEW.totalTime = timediff(NEW.walkEndTime,NEW.walkStartTime);
-- 	END IF;
-- END// 
-- DELIMITER ;


-- DELIMITER //
-- CREATE TRIGGER check_hospitaldiary_next_visit_update
-- 	AFTER UPDATE
--     ON hospitaldiarytbl FOR EACH ROW
-- BEGIN
-- 	IF (OLD.nextVisitIs != NEW.nextVisitIs) and NEW.nextVisitIs = 0  THEN
-- 		DELETE FROM hospitalreservationtbl WHERE hospitalreservationtbl.hospitalDiaryID=NEW.hospitalDiaryID;
-- 	END IF;
-- END// 
-- DELIMITER ;

-- DELIMITER //
-- CREATE TRIGGER check_shower_diary_due_Date_calcul
-- 	BEFORE INSERT
--     ON showerdiarytbl FOR EACH ROW
-- BEGIN
-- 	SET NEW.dueDate = DATE_ADD(NEW.lastShowerDate, INTERVAL NEW.cycleDay DAY);
-- END// 
-- DELIMITER ;

-- DELIMITER //
-- CREATE TRIGGER check_shower_diary_due_Date_calcul_update
-- 	BEFORE UPDATE
--     ON showerdiarytbl FOR EACH ROW
-- BEGIN
-- 	IF OLD.cycleDay != NEW.cycleDay or OLD.lastShowerDate != NEW.lastShowerDate THEN
-- 		SET NEW.dueDate = DATE_ADD(NEW.lastShowerDate, INTERVAL NEW.cycleDay DAY);
-- 	END IF;
-- END// 
-- DELIMITER ;

-- DELIMITER //
-- CREATE TRIGGER check_beauty_diary_due_Date_calcul
-- 	BEFORE INSERT
--     ON beautydiarytbl FOR EACH ROW
-- BEGIN
-- 	SET NEW.dueDate = DATE_ADD(NEW.lastBeautyDate, INTERVAL NEW.cycleDay DAY);
-- END// 
-- DELIMITER ;

-- DELIMITER //
-- CREATE TRIGGER check_beauty_diary_due_Date_calcul_update
-- 	BEFORE UPDATE
--     ON beautydiarytbl FOR EACH ROW
-- BEGIN
-- 	IF OLD.cycleDay != NEW.cycleDay or OLD.lastBeautyDate != NEW.lastBeautyDate THEN
-- 		SET NEW.dueDate = DATE_ADD(NEW.lastBeautyDate, INTERVAL NEW.cycleDay DAY);
-- 	END IF;
-- END// 
-- DELIMITER ;