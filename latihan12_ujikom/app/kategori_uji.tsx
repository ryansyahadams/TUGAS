import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";

import { db } from "../config/firebase";

export default function KategoriUji() {
  const [kodeKategori, setKodeKategori] = useState("");
  const [namaKategori, setNamaKategori] = useState("");
  const [durasi, setDurasi] = useState("");

  const [data, setData] = useState<any[]>([]);
  const [editId, setEditId] = useState("");

  useEffect(() => {
    tampilData();
  }, []);

  const tampilData = async () => {
    try {
      const q = query(
        collection(db, "kategori_uji"),
        orderBy("kode_kategori", "asc")
      );
      
      const querySnapshot = await getDocs(q);

      const hasil: any[] = [];

      querySnapshot.forEach((item) => {
        hasil.push({
          id: item.id,
          ...item.data(),
        });
      });

      setData(hasil);
    } catch (error) {
      console.log(error);
    }
  };

  const simpanData = async () => {
    if (kodeKategori.trim() === "" || namaKategori.trim() === "" || durasi.trim() === "") {
      Alert.alert("Peringatan", "Semua field wajib diisi");
      return;
    }

    const durasiAngka = Number(durasi);
    if (isNaN(durasiAngka) || durasiAngka <= 0) {
      Alert.alert("Peringatan", "Durasi harus berupa angka positif");
      return;
    }

    try {
      const q = query(
        collection(db, "kategori_uji"),
        orderBy("kode_kategori", "asc")
      );
      
      const querySnapshot = await getDocs(q);
      let kodeExist = false;
      
      querySnapshot.forEach((item) => {
        if (item.data().kode_kategori === kodeKategori.trim()) {
          kodeExist = true;
        }
      });

      if (kodeExist) {
        Alert.alert("Peringatan", "Kode kategori sudah ada");
        return;
      }

      await addDoc(collection(db, "kategori_uji"), {
        kode_kategori: kodeKategori.trim().toUpperCase(),
        nama_kategori: namaKategori.trim(),
        durasi: durasiAngka,
      });

      Alert.alert("Sukses", "Data berhasil disimpan");

      resetForm();
      tampilData();
    } catch (error) {
      console.log(error);
    }
  };

  const ubahData = async () => {
    if (kodeKategori.trim() === "" || namaKategori.trim() === "" || durasi.trim() === "") {
      Alert.alert("Peringatan", "Semua field wajib diisi");
      return;
    }

    const durasiAngka = Number(durasi);
    if (isNaN(durasiAngka) || durasiAngka <= 0) {
      Alert.alert("Peringatan", "Durasi harus berupa angka positif");
      return;
    }

    try {
      const q = query(
        collection(db, "kategori_uji"),
        orderBy("kode_kategori", "asc")
      );
      
      const querySnapshot = await getDocs(q);
      let kodeExist = false;
      
      querySnapshot.forEach((item) => {
        if (item.data().kode_kategori === kodeKategori.trim() && item.id !== editId) {
          kodeExist = true;
        }
      });

      if (kodeExist) {
        Alert.alert("Peringatan", "Kode kategori sudah digunakan oleh data lain");
        return;
      }

      await updateDoc(
        doc(db, "kategori_uji", editId),
        {
          kode_kategori: kodeKategori.trim().toUpperCase(),
          nama_kategori: namaKategori.trim(),
          durasi: durasiAngka,
        }
      );

      Alert.alert("Sukses", "Data berhasil diupdate");

      resetForm();
      tampilData();
    } catch (error) {
      console.log(error);
    }
  };

  const hapusData = (id: string) => {
    Alert.alert(
      "Konfirmasi",
      "Hapus data ini?",
      [
        {
          text: "Batal",
          style: "cancel",
        },
        {
          text: "Hapus",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "kategori_uji", id));
              Alert.alert("Sukses", "Data berhasil dihapus");
              tampilData();
            } catch (error) {
              console.log(error);
              Alert.alert("Error", "Gagal menghapus data");
            }
          },
        },
      ]
    );
  };

  const editData = (item: any) => {
    setEditId(item.id);
    setKodeKategori(item.kode_kategori);
    setNamaKategori(item.nama_kategori);
    setDurasi(item.durasi.toString());
  };

  const resetForm = () => {
    setEditId("");
    setKodeKategori("");
    setNamaKategori("");
    setDurasi("");
  };

  const renderItem = ({ item, index }: { item: any; index: number }) => (
    <View style={styles.row}>
      <View style={[styles.cellWrapper, styles.cellNo]}>
        <Text style={styles.cellText}>{index + 1}</Text>
      </View>
      
      <View style={[styles.cellWrapper, styles.cellKode]}>
        <Text style={styles.cellText}>{item.kode_kategori}</Text>
      </View>
      
      <View style={[styles.cellWrapper, styles.cellNama]}>
        <Text style={styles.cellText} numberOfLines={1}>{item.nama_kategori}</Text>
      </View>
      
      <View style={[styles.cellWrapper, styles.cellDurasi]}>
        <Text style={styles.cellText}>{item.durasi}</Text>
      </View>
      
      <View style={[styles.cellWrapper, styles.cellAksi]}>
        <TouchableOpacity
          style={[styles.actionButton, styles.btnEdit]}
          onPress={() => editData(item)}
        >
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.btnDelete]}
          onPress={() => hapusData(item.id)}
        >
          <Text style={styles.actionText}>Hapus</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.judul}>
        MASTER KATEGORI UJIAN
      </Text>

      <View style={styles.card}>
        <TextInput
          style={styles.input}
          placeholder="Kode Kategori"
          value={kodeKategori}
          onChangeText={setKodeKategori}
          autoCapitalize="characters"
        />

        <TextInput
          style={styles.input}
          placeholder="Nama Kategori"
          value={namaKategori}
          onChangeText={setNamaKategori}
        />

        <TextInput
          style={styles.input}
          placeholder="Durasi (Menit)"
          keyboardType="numeric"
          value={durasi}
          onChangeText={setDurasi}
        />

        <View style={styles.buttonGroup}>
          {editId === "" ? (
            <TouchableOpacity
              style={[styles.button, styles.btnSimpan]}
              onPress={simpanData}
            >
              <Text style={styles.btnText}>SIMPAN</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity
                style={[styles.button, styles.btnUpdate]}
                onPress={ubahData}
              >
                <Text style={styles.btnText}>UPDATE</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.btnBatal]}
                onPress={resetForm}
              >
                <Text style={styles.btnText}>BATAL</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      <Text style={styles.subJudul}>
        DATA KATEGORI UJIAN
      </Text>

      <View style={styles.tableHeader}>
        <View style={[styles.headerWrapper, styles.cellNo]}>
          <Text style={styles.headerText}>No</Text>
        </View>
        <View style={[styles.headerWrapper, styles.cellKode]}>
          <Text style={styles.headerText}>Kode</Text>
        </View>
        <View style={[styles.headerWrapper, styles.cellNama]}>
          <Text style={styles.headerText}>Kategori</Text>
        </View>
        <View style={[styles.headerWrapper, styles.cellDurasi]}>
          <Text style={styles.headerText}>Durasi</Text>
        </View>
        <View style={[styles.headerWrapper, styles.cellAksi]}>
          <Text style={styles.headerText}>Aksi</Text>
        </View>
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Belum ada data kategori ujian</Text>
          </View>
        }
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },

  judul: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 15,
    color: "#1e293b",
  },

  card: {
    backgroundColor: "#fff",
    margin: 10,
    padding: 15,
    borderRadius: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    fontSize: 16,
    backgroundColor: "#fff",
  },

  buttonGroup: {
    flexDirection: "row",
    gap: 10,
  },

  button: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
  },

  btnSimpan: {
    backgroundColor: "#2563eb",
  },

  btnUpdate: {
    backgroundColor: "#16a34a",
    flex: 1,
  },

  btnBatal: {
    backgroundColor: "#64748b",
    flex: 1,
  },

  btnText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },

  subJudul: {
    fontSize: 18,
    fontWeight: "bold",
    margin: 10,
    color: "#1e293b",
  },

  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#1e293b",
    paddingVertical: 12,
    paddingHorizontal: 5,
    marginHorizontal: 10,
    borderRadius: 8,
    marginBottom: 5,
  },

  headerWrapper: {
    justifyContent: "center",
    alignItems: "center",
  },

  headerText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 13,
  },

  row: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 10,
    marginBottom: 5,
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "center",
  },

  cellWrapper: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },

  cellText: {
    fontSize: 14,
    color: "#334155",
    textAlign: "center",
  },

  cellNo: {
    flex: 0.6,
    minWidth: 40,
  },

  cellKode: {
    flex: 1,
    minWidth: 70,
  },

  cellNama: {
    flex: 1.5,
    minWidth: 100,
  },

  cellDurasi: {
    flex: 0.8,
    minWidth: 60,
  },

  cellAksi: {
    flex: 1.2,
    minWidth: 80,
    flexDirection: "column", // Mengubah dari row ke column
    gap: 4,
    alignItems: "center",
    justifyContent: "center",
  },

  actionButton: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 4,
    width: "100%", // Membuat tombol selebar kolom
    minWidth: 60,
  },

  btnEdit: {
    backgroundColor: "#f59e0b",
  },

  btnDelete: {
    backgroundColor: "#dc2626",
  },

  actionText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
    textAlign: "center",
  },

  emptyContainer: {
    backgroundColor: "#fff",
    marginHorizontal: 10,
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "center",
  },

  emptyText: {
    fontSize: 16,
    color: "#94a3b8",
  },
});