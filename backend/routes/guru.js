














































































































































































































































































































    // query untuk mengambil data pendaftaran yang terdaftar
    let dataQuery = `
            SELECT 
                pi.id_penditem,
                pi.tanggal_mulai AS tanggal_sesi,
                j.hari_mengajar,
                pi.jam_mulai_les,
                pi.jam_selesai_les,
                u.nama AS nama_murid,
                mp.nama AS nama_mapel,
                pi.status
            FROM pendaftaran_item pi
            JOIN pendaftaran p ON pi.id_daftar = p.id_daftar
            JOIN user u ON p.id_murid = u.id_user
            JOIN mata_pelajaran mp ON pi.id_mapel = mp.id_mapel
            JOIN jadwal j ON pi.id_jadwal = j.id_jadwal
            JOIN jadwal_kesediaan jk ON j.id_kesediaan = jk.id_kesediaan
            WHERE jk.id_guru = ?
        `;
    const dataParams = [id_guru];

    // handle pencarian berdasarkan nama murid atau mata pelajaran
    if (search) {
      const searchPattern = `%${search}%`;
      const searchSql = ` AND (u.nama LIKE ? OR mp.nama LIKE ?)`;

      countMurid += searchSql;
      countParams.push(searchPattern, searchPattern);

      dataQuery += searchSql;
      dataParams.push(searchPattern, searchPattern);
    }

    // sorting dan pagination
    dataQuery += ` ORDER BY pi.tanggal_mulai DESC, pi.jam_mulai_les DESC LIMIT ? OFFSET ?`;
    dataParams.push(limit, offset);

    const [countResult] = await db.query(countMurid, countParams);
    const [dataResult] = await db.query(dataQuery, dataParams);

    const totalItems = countResult[0].total_items;

    res.status(200).json({
      status: "success",
      pagination: {
        total_items: totalItems,
        total_pages: Math.ceil(totalItems / limit),
        current_page: page,
        limit: limit,
      },
      data: dataResult,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
});
// query untuk menampilkan jadwal kelas di dashboard guru
router.get("/dashboard", async (req, res) => {
  const id_guru = req.user.id_user;

  try {
    // query untuk mengambil lama waktu mengajar
    const sqlStats = `
            SELECT 
                COALESCE(SUM(CASE WHEN pi.status = 'Selesai' THEN TIMESTAMPDIFF(MINUTE, pi.jam_mulai_les, pi.jam_selesai_les) ELSE 0 END) / 60, 0) AS total_jam_mengajar,
                COUNT(DISTINCT p.id_murid) AS jumlah_murid_aktif,
                COUNT(CASE WHEN pi.status = 'Mendatang' THEN 1 END) AS total_sesi_aktif
            FROM pendaftaran_item pi
            JOIN pendaftaran p ON pi.id_daftar = p.id_daftar
            JOIN jadwal j ON pi.id_jadwal = j.id_jadwal
            JOIN jadwal_kesediaan jk ON j.id_kesediaan = jk.id_kesediaan
            WHERE jk.id_guru = ?
        `;

    // query untuk mengambil jadwal yang ada di rentang seminggu
    const sqlJadwalTerdekat = `
            SELECT 
                pi.id_penditem,
                pi.tanggal_mulai AS tanggal_sesi,
                pi.jam_mulai_les,
                pi.jam_selesai_les,
                u.nama AS nama_murid,
                tp.tingkat,
                tp.jenjang,
                mp.nama AS nama_mapel,
                pi.status
            FROM pendaftaran_item pi
            JOIN pendaftaran p ON pi.id_daftar = p.id_daftar
            JOIN user u ON p.id_murid = u.id_user
            JOIN murid m ON u.id_user = m.id_murid
            LEFT JOIN tingkat_pendidikan tp ON m.id_pendidikan = tp.id_pendidikan
            JOIN mata_pelajaran mp ON pi.id_mapel = mp.id_mapel
            JOIN jadwal j ON pi.id_jadwal = j.id_jadwal
            JOIN jadwal_kesediaan jk ON j.id_kesediaan = jk.id_kesediaan
            WHERE jk.id_guru = ? 
              AND pi.tanggal_mulai >= CURDATE()
            ORDER BY pi.tanggal_mulai ASC, pi.jam_mulai_les ASC
            LIMIT 3
        `;

    // query untuk mengambil req kelas yang baru aja dibuat
    const sqlPermintaanKelas = `
            SELECT 
                pi.id_penditem,
                pi.tanggal_mulai AS tanggal_sesi,
                pi.jam_mulai_les,
                u.nama AS nama_murid,
                tp.tingkat,
                tp.jenjang,
                mp.nama AS nama_mapel
            FROM pendaftaran_item pi
            JOIN pendaftaran p ON pi.id_daftar = p.id_daftar
            JOIN user u ON p.id_murid = u.id_user
            JOIN murid m ON u.id_user = m.id_murid
            LEFT JOIN tingkat_pendidikan tp ON m.id_pendidikan = tp.id_pendidikan
            JOIN mata_pelajaran mp ON pi.id_mapel = mp.id_mapel
            JOIN jadwal j ON pi.id_jadwal = j.id_jadwal
            JOIN jadwal_kesediaan jk ON j.id_kesediaan = jk.id_kesediaan
            WHERE jk.id_guru = ? 
              AND pi.status = 'Mendatang'
              AND pi.tanggal_mulai >= CURDATE()
            ORDER BY pi.id_penditem DESC
            LIMIT 2
        `;

    // query yang perlu dieksekusi terdapat 3 query sehingga menggunakan Promies.all untuk memudahkan menjalankan query nya
    const [[statsResult], [jadwalResult], [permintaanResult]] =
      await Promise.all([
        db.query(sqlStats, [id_guru]),
        db.query(sqlJadwalTerdekat, [id_guru]),
        db.query(sqlPermintaanKelas, [id_guru]),
      ]);

    // menyusun response sesuai yang diminta dashboard page
    const dashboardData = {
      statistik: {
        total_jam_mengajar: parseFloat(
          statsResult[0].total_jam_mengajar,
        ).toFixed(1),
        jumlah_murid_aktif: statsResult[0].jumlah_murid_aktif,
        total_sesi_aktif: statsResult[0].total_sesi_aktif,
      },
      jadwal_minggu_ini: jadwalResult.map((item) => ({
        id_penditem: item.id_penditem,
        tanggal: item.tanggal_sesi,
        waktu: `${item.jam_mulai_les.substring(0, 5)} - ${item.jam_selesai_les.substring(0, 5)}`,
        mapel: item.nama_mapel,
        murid: item.nama_murid,
        deskripsi_kelas: `Kelas ${item.tingkat} ${item.jenjang}`,
        status: item.status,
      })),
      permintaan_kelas: permintaanResult.map((item) => ({
        id_penditem: item.id_penditem,
        tanggal: item.tanggal_sesi,
        waktu: `${item.jam_mulai_les.substring(0, 5)} WIB`,
        murid: item.nama_murid,
        deskripsi: `${item.nama_mapel} • ${item.jenjang} Kelas ${item.tingkat}`,
      })),
    };

    res.status(200).json({
      status: "success",
      data: dashboardData,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
});