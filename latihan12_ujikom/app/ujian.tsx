import React, { useEffect, useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import { Picker } from "@react-native-picker/picker";

import {
    addDoc,
    collection,
    getDocs,
} from "firebase/firestore";

import { db } from "../config/firebase";

import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

export default function Ujian() {
  const [kategoriList, setKategoriList] = useState([]);
  const [soalList, setSoalList] = useState([]);

  const [nama, setNama] = useState("");
  const [nim, setNim] = useState("");

  const [kategori, setKategori] = useState("");
  const [durasi, setDurasi] = useState(90);

  const [mulai, setMulai] = useState(false);

  const [nomorSoal, setNomorSoal] = useState(0);

  const [jawaban, setJawaban] = useState({});

  const [timeLeft, setTimeLeft] =
    useState(90 * 60);

  const [hasil, setHasil] = useState(null);

  useEffect(() => {
    loadKategori();
  }, []);

  useEffect(() => {
    let interval: any;

    if (mulai) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            submitUjian();
            return 0;
          }

          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [mulai]);

  const loadKategori = async () => {
    const snapshot = await getDocs(
      collection(db, "kategori_uji")
    );

    const data: any = [];

    snapshot.forEach((doc) => {
      data.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    setKategoriList(data);
  };

  const mulaiUjian = async () => {
    if (
      nama === "" ||
      nim === "" ||
      kategori === ""
    ) {
      Alert.alert(
        "Lengkapi data peserta"
      );
      return;
    }

    const pilihKategori =
      kategoriList.find(
        (x: any) =>
          x.kode_kategori === kategori
      );

    if (pilihKategori) {
      setDurasi(
        Number(pilihKategori.durasi)
      );

      setTimeLeft(
        Number(pilihKategori.durasi) * 60
      );
    }

    const snapshot = await getDocs(
      collection(db, "bank_soal")
    );

    const data: any = [];

    snapshot.forEach((doc) => {
      const item: any = doc.data();

      if (
        item.kode_kategori === kategori
      ) {
        data.push({
          id: doc.id,
          ...item,
        });
      }
    });

    setSoalList(data);
    setMulai(true);
  };

  const pilihJawaban = (
    soalId: string,
    value: string
  ) => {
    setJawaban({
      ...jawaban,
      [soalId]: value,
    });
  };

  const submitUjian = async () => {
    let benar = 0;

    soalList.forEach((item: any) => {
      if (
        jawaban[item.id] ===
        item.jawaban_benar
      ) {
        benar++;
      }
    });

    const salah =
      soalList.length - benar;

    const nilai =
      soalList.length === 0
        ? 0
        : Math.round(
            (benar /
              soalList.length) *
              100
          );

    const hasilData = {
      nama,
      nim,
      kategori,
      benar,
      salah,
      nilai,
      tanggal:
        new Date().toLocaleDateString(
          "id-ID"
        ),
    };

    await addDoc(
      collection(db, "hasil_uji"),
      hasilData
    );

    setHasil(hasilData);

    setMulai(false);

    Alert.alert(
      "Ujian Selesai",
      `Nilai Anda ${nilai}`
    );
  };

 const cetakPDF = async () => {
  if (!hasil) return;

  const status =
    hasil.nilai >= 75
      ? "LULUS"
      : "TIDAK LULUS";

  const html = `
  <html>
  <head>
    <style>
      body{
        font-family: Arial;
        padding:40px;
      }

      .container{
        border:4px solid #000;
        padding:25px;
      }

      .header{
        text-align:center;
      }

      .kampus{
        font-size:26px;
        font-weight:bold;
      }

      .judul{
        font-size:30px;
        font-weight:bold;
        margin-top:20px;
      }

      .subjudul{
        font-size:18px;
        margin-bottom:25px;
      }

      table{
        width:100%;
        border-collapse:collapse;
        margin-top:15px;
      }

      td,th{
        border:1px solid black;
        padding:10px;
      }

      .nilai{
        text-align:center;
        margin-top:30px;
      }

      .angka{
        font-size:70px;
        color:#2563eb;
        font-weight:bold;
      }

      .status{
        text-align:center;
        margin-top:15px;
        font-size:30px;
        font-weight:bold;
        color:${
          status === "LULUS"
            ? "green"
            : "red"
        };
      }

      .ttd{
        margin-top:80px;
        text-align:right;
      }
    </style>
  </head>

  <body>

  <div class="container">

    <div class="header">

      <div class="kampus">
        STIKOM POLTEK CIREBON
      </div>

      <div class="judul">
        SERTIFIKAT HASIL UJIAN
      </div>

     

    </div>

    <table>

      <tr>
        <td width="30%">
          Nama Peserta
        </td>
        <td>
          ${hasil.nama}
        </td>
      </tr>

      <tr>
        <td>
          NIM
        </td>
        <td>
          ${hasil.nim}
        </td>
      </tr>

      <tr>
        <td>
          Kategori Ujian
        </td>
        <td>
          ${hasil.kategori}
        </td>
      </tr>

      <tr>
        <td>
          Tanggal
        </td>
        <td>
          ${hasil.tanggal}
        </td>
      </tr>

    </table>

    <br>

    <table>

      <tr>
        <th>Keterangan</th>
        <th>Nilai</th>
      </tr>

      <tr>
        <td>Jumlah Soal</td>
        <td>
          ${hasil.benar + hasil.salah}
        </td>
      </tr>

      <tr>
        <td>Jawaban Benar</td>
        <td>
          ${hasil.benar}
        </td>
      </tr>

      <tr>
        <td>Jawaban Salah</td>
        <td>
          ${hasil.salah}
        </td>
      </tr>

      <tr>
        <td>Nilai Akhir</td>
        <td>
          ${hasil.nilai}
        </td>
      </tr>

    </table>

    <div class="nilai">
      <div>SKOR AKHIR</div>

      <div class="angka">
        ${hasil.nilai}
      </div>
    </div>

    <div class="status">
      ${status}
    </div>

    <div class="ttd">

      Cirebon,
      ${hasil.tanggal}
      <br><br>

      Penguji
      <br><br><br><br>

      ___________________

    </div>

  </div>

  </body>
  </html>
  `;

  const file =
    await Print.printToFileAsync({
      html,
    });

  await Sharing.shareAsync(
    file.uri
  );
};

  if (!mulai && !hasil) {
    return (
      <ScrollView
        style={styles.container}
      >
        <Text style={styles.title}>
          UJIAN ONLINE
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Nama"
          value={nama}
          onChangeText={setNama}
        />

        <TextInput
          style={styles.input}
          placeholder="NIM"
          value={nim}
          onChangeText={setNim}
        />

        <Picker
          selectedValue={kategori}
          onValueChange={setKategori}
        >
          <Picker.Item
            label="Pilih Kategori"
            value=""
          />

          {kategoriList.map(
            (item: any) => (
              <Picker.Item
                key={item.id}
                label={
                  item.nama_kategori
                }
                value={
                  item.kode_kategori
                }
              />
            )
          )}
        </Picker>

        <TouchableOpacity
          style={styles.button}
          onPress={mulaiUjian}
        >
          <Text
            style={styles.buttonText}
          >
            MULAI UJIAN
          </Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  if (hasil) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>
          HASIL UJIAN
        </Text>

        <Text>
          Nama : {hasil.nama}
        </Text>

        <Text>
          NIM : {hasil.nim}
        </Text>

        <Text>
          Nilai : {hasil.nilai}
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={cetakPDF}
        >
          <Text
            style={styles.buttonText}
          >
            CETAK HASIL
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const soal =
    soalList[nomorSoal];

  return (
    <View style={styles.container}>
      <Text style={styles.timer}>
        Sisa Waktu :
        {" "}
        {Math.floor(
          timeLeft / 60
        )}
        :
        {(timeLeft % 60)
          .toString()
          .padStart(2, "0")}
      </Text>

      <Text style={styles.soal}>
        {nomorSoal + 1}.
        {" "}
        {soal?.pertanyaan}
      </Text>

      {["A", "B", "C", "D"].map(
        (huruf) => (
          <TouchableOpacity
            key={huruf}
            style={styles.option}
            onPress={() =>
              pilihJawaban(
                soal.id,
                huruf
              )
            }
          >
            <Text>
              {huruf}.{" "}
              {
                soal[
                  `pilihan_${huruf.toLowerCase()}`
                ]
              }
            </Text>
          </TouchableOpacity>
        )
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          if (
            nomorSoal <
            soalList.length - 1
          ) {
            setNomorSoal(
              nomorSoal + 1
            );
          } else {
            submitUjian();
          }
        }}
      >
        <Text
          style={styles.buttonText}
        >
          {nomorSoal ===
          soalList.length - 1
            ? "SUBMIT"
            : "BERIKUTNYA"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{
    flex:1,
    padding:20,
    backgroundColor:"#1826eb"
  },
  title:{
    fontSize:24,
    fontWeight:"bold",
    marginBottom:20
  },
  input:{
    borderWidth:1,
    padding:10,
    marginBottom:10,
    borderRadius:8
  },
  button:{
    backgroundColor:"#2563eb",
    padding:15,
    borderRadius:8,
    marginTop:10
  },
  buttonText:{
    color:"#fff",
    textAlign:"center",
    fontWeight:"bold"
  },
  timer:{
    fontSize:22,
    color:"red",
    fontWeight:"bold",
    marginBottom:20
  },
  soal:{
    fontSize:18,
    marginBottom:20
  },
  option:{
    borderWidth:1,
    padding:15,
    marginBottom:10,
    borderRadius:8
  }
});

