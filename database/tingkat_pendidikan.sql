CREATE TABLE tingkat_pendidikan (
    id_pendidikan INT AUTO_INCREMENT PRIMARY KEY,
    jenjang VARCHAR(50) NOT NULL,
    tingkat INT NOT NULL,
    
    UNIQUE KEY uq_pendidikan  (jenjang, tingkat)  -- Memastikan kombinasi jenjang dan tingkat unik (tidak ada duplikat 'SMA Kelas 3' dua kali)
);
INSERT INTO tingkat_pendidikan (jenjang, tingkat)
VALUES
('SD', 1),
('SD', 2),
('SD', 3),
('SD', 4),
('SD', 5),
('SD', 6),
('SMP', 1),
('SMP', 2),
('SMP', 3),
('SMA', 1),
('SMA', 2),
('SMA', 3);

-- DUMMY DATA
INSERT INTO user(nama,role,email,password) VALUES('John Doe','murid','JohnDoe@gmail.com','$2a$10$/G5JfjjQYuyLsvfZAhr.Z.yX2YljM1I7pzJvw4fQRahOFBUclRxS.');
INSERT INTO user(nama,role,email,password) VALUES('Agus','guru','Agus@gmail.com','$2a$10$/G5JfjjQYuyLsvfZAhr.Z.yX2YljM1I7pzJvw4fQRahOFBUclRxS.');
INSERT INTO user(nama,role,email,password) VALUES('Hansel','murid','Hansel@gmail.com','$2a$10$/G5JfjjQYuyLsvfZAhr.Z.yX2YljM1I7pzJvw4fQRahOFBUclRxS.');
