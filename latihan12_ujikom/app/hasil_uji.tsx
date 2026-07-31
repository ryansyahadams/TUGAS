import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  collection,
  deleteDoc,
  doc,
  getDocs,
} from "firebase/firestore";

import { db } from "../config/firebase";

import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

export default function HasilUji() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);

    try {
      const snapshot = await getDocs(
        collection(db, "hasil_uji")
      );

      const hasil: any[] = [];

      snapshot.forEach((item) => {
        hasil.push({
          id: item.id,
          ...item.data(),
        });
      });

      setData(hasil);
    } catch (error) {
      console.log(error);
    }

    setLoading(false);
  };

  const hapusData = (id: string) => {
    Alert.alert(
      "Konfirmasi",
      "Hapus data peserta?",
      [
        {
          text: "Batal",
        },
        {
          text: "Hapus",
          onPress: async () => {
            await deleteDoc(
              doc(db, "hasil_uji", id)
            );

            loadData();
          },
        },
      ]
    );
  };

  const cetakPDF = async () => {
    const jumlahPeserta = data.length;

    const rataRata =
      data.length > 0
        ? (
            data.reduce(
              (a, b) =>
                a + Number(b.nilai),
              0
            ) / data.length
          ).toFixed(2)
        : "0";

    const jumlahLulus =
      data.filter(
        (x) =>
          Number(x.nilai) >= 75
      ).length;

    const jumlahTidakLulus =
      data.filter(
        (x) =>
          Number(x.nilai) < 75
      ).length;

    const rows = data
      .map(
        (item, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${item.nim}</td>
          <td>${item.nama}</td>
          <td>${item.kategori}</td>
          <td>${item.benar}</td>
          <td>${item.salah}</td>
          <td>${item.nilai}</td>
        </tr>
      `
      )
      .join("");

    const html = `
    <html>
    <head>
      <style>

      body{
        font-family: Arial;
        padding:20px;
      }

      .header{
        text-align:center;
      }

      .kampus{
        font-size:24px;
        font-weight:bold;
      }

      .judul{
        font-size:20px;
        margin-top:10px;
        font-weight:bold;
      }

      .subjudul{
        margin-top:5px;
      }

      table{
        width:100%;
        border-collapse:collapse;
        margin-top:20px;
      }

      th{
        background:#dbeafe;
      }

      td,th{
        border:1px solid black;
        padding:8px;
        text-align:center;
      }

      .summary{
        margin-top:20px;
        font-size:14px;
      }

      .summary-table{
        width:100%;
        margin-top:10px;
      }

      .summary-table td{
        padding:10px;
        border:1px solid black;
      }

      .label-summary{
        font-weight:bold;
        text-align:left;
        width:70%;
      }

      .value-summary{
        text-align:center;
        font-weight:bold;
        width:30%;
      }

      .lulus{
        color:green;
      }

      .tidak-lulus{
        color:red;
      }

      .ttd{
        margin-top:80px;
        width:100%;
      }

      .ttd td{
        border:none;
      }

      </style>
    </head>

    <body>

      <div class="header">

        <div class="kampus">
          STIKOM POLTEK CIREBON
        </div>

        <div>
          PROGRAM STUDI TEKNIK INFORMATIKA
        </div>

        <div>
          SISTEM UJI KOMPETENSI MAHASISWA
        </div>

        <hr>

        <div class="judul">
          LAPORAN REKAP HASIL UJIAN
        </div>

        <div class="subjudul">
          Tanggal Cetak :
          ${new Date().toLocaleDateString(
            "id-ID"
          )}
        </div>

      </div>

      <table>

        <tr>
          <th>No</th>
          <th>NIM</th>
          <th>Nama Peserta</th>
          <th>Kategori</th>
          <th>Benar</th>
          <th>Salah</th>
          <th>Nilai</th>
        </tr>

        ${rows}

      </table>

      <div class="summary">
        <h3>RINGKASAN HASIL UJIAN</h3>
        
        <table class="summary-table">
          <tr>
            <td class="label-summary">Jumlah Peserta</td>
            <td class="value-summary">${jumlahPeserta}</td>
          </tr>
          <tr>
            <td class="label-summary lulus">Lulus (≥ 75)</td>
            <td class="value-summary lulus">${jumlahLulus}</td>
          </tr>
          <tr>
            <td class="label-summary tidak-lulus">Tidak Lulus (&lt; 75)</td>
            <td class="value-summary tidak-lulus">${jumlahTidakLulus}</td>
          </tr>
          <tr>
            <td class="label-summary">Rata-rata Nilai</td>
            <td class="value-summary">${rataRata}</td>
          </tr>
        </table>
      </div>

      <table class="ttd">

        <tr>

          <td>
            Mengetahui,
            <br>
            Ketua Program Studi
            <br><br><br><br><br>

            (____________________)
            <br>
            NIDN :
          </td>

          <td>
            Penguji
            <br><br><br><br><br>

            (____________________)
            <br>
            NIDN :
          </td>

        </tr>

      </table>

    </body>
    </html>
    `;

    const pdf =
      await Print.printToFileAsync({
        html,
      });

    await Sharing.shareAsync(
      pdf.uri
    );
  };

  // Menghitung statistik
  const jumlahPeserta = data.length;
  const jumlahLulus = data.filter((x) => Number(x.nilai) >= 75).length;
  const jumlahTidakLulus = data.filter((x) => Number(x.nilai) < 75).length;
  const rataRata = data.length > 0
    ? (data.reduce((a, b) => a + Number(b.nilai), 0) / data.length).toFixed(2)
    : "0";

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>
        HASIL UJIAN PESERTA
      </Text>

      <TouchableOpacity
        style={styles.btnCetak}
        onPress={cetakPDF}
      >
        <Text style={styles.btnText}>
          CETAK LAPORAN PDF
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.btnRefresh}
        onPress={loadData}
      >
        <Text style={styles.btnText}>
          REFRESH DATA
        </Text>
      </TouchableOpacity>

      {/* Header Table - Horizontal */}
      <View style={styles.headerTable}>
        <Text style={styles.headerCell}>
          NIM
        </Text>

        <Text style={styles.headerCell}>
          Nama
        </Text>

        <Text style={styles.headerCell}>
          Nilai
        </Text>
      </View>

      {/* Data Table - Horizontal */}
      <FlatList
        data={data}
        scrollEnabled={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.cell}>
              {item.nim}
            </Text>

            <Text style={styles.cell}>
              {item.nama}
            </Text>

            <Text style={styles.cell}>
              {item.nilai}
            </Text>

            <TouchableOpacity
              style={styles.btnHapus}
              onPress={() =>
                hapusData(item.id)
              }
            >
              <Text
                style={{
                  color: "#fff",
                }}
              >
                Hapus
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Tabel Ringkasan - Vertikal seperti tabel di atas */}
      <View style={styles.summaryBox}>
        <Text style={styles.summaryTitle}>
          RINGKASAN HASIL UJIAN
        </Text>

        {/* Header Summary Table */}
        <View style={styles.headerSummary}>
          <Text style={styles.headerSummaryLabel}>
            KETERANGAN
          </Text>
          <Text style={styles.headerSummaryValue}>
            JUMLAH
          </Text>
        </View>

        {/* Row 1: Jumlah Peserta */}
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>
            Jumlah Peserta
          </Text>
          <Text style={styles.summaryValue}>
            {jumlahPeserta}
          </Text>
        </View>

        {/* Row 2: Lulus */}
        <View style={[styles.summaryRow, styles.rowLulus]}>
          <Text style={[styles.summaryLabel, styles.textLulus]}>
            Lulus (≥ 75)
          </Text>
          <Text style={[styles.summaryValue, styles.textLulus]}>
            {jumlahLulus}
          </Text>
        </View>

        {/* Row 3: Tidak Lulus */}
        <View style={[styles.summaryRow, styles.rowTidakLulus]}>
          <Text style={[styles.summaryLabel, styles.textTidakLulus]}>
            Tidak Lulus (&lt; 75)
          </Text>
          <Text style={[styles.summaryValue, styles.textTidakLulus]}>
            {jumlahTidakLulus}
          </Text>
        </View>

        {/* Row 4: Rata-rata */}
        <View style={[styles.summaryRow, styles.rowRataRata]}>
          <Text style={[styles.summaryLabel, styles.textRataRata]}>
            Rata-rata Nilai
          </Text>
          <Text style={[styles.summaryValue, styles.textRataRata]}>
            {rataRata}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
    padding: 15,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#1e293b",
  },

  btnCetak: {
    backgroundColor: "#16a34a",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  btnRefresh: {
    backgroundColor: "#2563eb",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  btnText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },

  // Style untuk tabel data (horizontal)
  headerTable: {
    flexDirection: "row",
    backgroundColor: "#1e293b",
    padding: 12,
    borderRadius: 8,
    marginBottom: 5,
  },

  headerCell: {
    flex: 1,
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 14,
  },

  row: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 12,
    marginBottom: 5,
    alignItems: "center",
    borderRadius: 8,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },

  cell: {
    flex: 1,
    textAlign: "center",
    fontSize: 14,
  },

  btnHapus: {
    backgroundColor: "#dc2626",
    padding: 8,
    borderRadius: 5,
    paddingHorizontal: 12,
  },

  // Style untuk tabel ringkasan (vertikal)
  summaryBox: {
    marginTop: 20,
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 20,
  },

  summaryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#1e293b",
    textAlign: "center",
  },

  // Header summary
  headerSummary: {
    flexDirection: "row",
    backgroundColor: "#1e293b",
    padding: 10,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },

  headerSummaryLabel: {
    flex: 2,
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
    textAlign: "left",
  },

  headerSummaryValue: {
    flex: 1,
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
    textAlign: "center",
  },

  // Row summary
  summaryRow: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 10,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },

  summaryLabel: {
    flex: 2,
    fontSize: 14,
    color: "#475569",
    fontWeight: "500",
  },

  summaryValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: "bold",
    color: "#1e293b",
    textAlign: "center",
  },

  // Warna khusus
  rowLulus: {
    backgroundColor: "#f0fdf4",
  },

  rowTidakLulus: {
    backgroundColor: "#fef2f2",
  },

  rowRataRata: {
    backgroundColor: "#eff6ff",
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },

  textLulus: {
    color: "#16a34a",
  },

  textTidakLulus: {
    color: "#dc2626",
  },

  textRataRata: {
    color: "#2563eb",
  },
});