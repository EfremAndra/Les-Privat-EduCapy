CREATE TABLE jadwal_kesediaan (
    id_kesediaan INT AUTO_INCREMENT PRIMARY KEY,
    id_guru INT,
    id_mapel INT,
    tanggal_awal_bersedia DATE,
    tanggal_akhir_bersedia DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    Foreign Key (id_guru) REFERENCES guru(id_guru),
   
    CONSTRAINT chk_tanggal_kesediaan CHECK (tanggal_akhir_bersedia >= tanggal_awal_bersedia)  --  Constraint: Tanggal akhir tidak boleh mendahului tanggal awal
);

CREATE TABLE jadwal (
    id_jadwal INT AUTO_INCREMENT PRIMARY KEY,
    id_kesediaan INT NOT NULL,
    hari_mengajar ENUM('Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu') NOT NULL,
    jam_mulai TIME NOT NULL,
    jam_selesai TIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    Foreign Key (id_kesediaan) REFERENCES jadwal_kesediaan(id_kesediaan) ON DELETE CASCADE,
 
    CONSTRAINT chk_jam_mengajar CHECK (jam_selesai > jam_mulai)    --  Constraint: Jam selesai les harus setelah jam mulai les
);

CREATE TABLE pendaftaran (
    id_daftar INT AUTO_INCREMENT PRIMARY KEY,
    id_murid INT NOT NULL,

    Foreign Key (id_murid) REFERENCES murid(id_murid) ON DELETE CASCADE
);

CREATE TABLE pendaftaran_item (
    id_pendItem INT AUTO_INCREMENT PRIMARY KEY,
    id_daftar INT NOT NULL,
    id_jadwal INT NOT NULL,
    id_mapel INT NOT NULL,
    tanggal_mulai DATE NOT NULL,
    tanggal_selesai DATE NOT NULL,
    jam_mulai_les TIME NOT NULL,
    jam_selesai_les TIME NOT NULL,
    status ENUM('Mendatang', 'Selesai', 'Batal'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    Foreign Key (id_daftar) REFERENCES pendaftaran(id_daftar) ON DELETE CASCADE,
    Foreign Key (id_jadwal) REFERENCES jadwal(id_jadwal) ON DELETE CASCADE,
    Foreign Key (id_mapel) REFERENCES mata_pelajaran(id_mapel) ON DELETE CASCADE,
   
    CONSTRAINT chk_tanggal_les CHECK (tanggal_selesai >= tanggal_mulai),  -- Constraints logika waktu transaksi
