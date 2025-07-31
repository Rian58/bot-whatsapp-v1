// index.js

// Whatsapp & Utility
const { Client, MessageMedia, LocalAuth } = require("whatsapp-web.js");
const qrcode_terminal = require("qrcode-terminal");
const fs = require("fs");
const path = require("path");
const util = require("util");

// Library Fitur
const Tesseract = require("tesseract.js");
const QRCode = require("qrcode");
const jsQR = require("jsqr");
const { createCanvas, loadImage } = require("canvas");
const axios = require("axios");
const FormData = require("form-data");

// Ganti dengan API Secret Anda dari convertapi.com
const CONVERTAPI_SECRET = "CU6YQflHbD9w1keEbkA2AXHnk36vkY9m";
// BARU: Masukkan API Key Anda dari slazzer.com di sini
const SLAZZER_API_KEY = "8eac29f472cd4d75b7fadcf08bf4117b";

const userChoices = {};

const JAVANESE_QUOTES = [
  "Urip iku urup. (Hidup itu menyala, hidup itu hendaknya memberi manfaat bagi orang lain).",
  "Gusti Allah mboten sare. (Tuhan tidak tidur).",
  "Alon-alon waton kelakon. (Pelan-pelan saja yang penting selesai).",
  "Nek wes niat kerjo, ojo lali wektune. Nek wes wektune, yo ndang budhal!",
  "Ojo lali ngopi, ben ora edan.",
  "Witing tresno jalaran soko kulino, lunture tresno jalaran ono wong liyo.",
  "Sopo sing nandur, bakal manen. (Siapa yang menanam, dia yang akan menuai).",
  "Uripmu koyo wit gedhang, due jantung tapi ora due ati.",
  "Dudu sanak, dudu kadang, yen mati melu kelangan.",
];

const FUN_FACTS = [
  "Gurita memiliki tiga jantung.",
  "Satu sendok teh bintang neutron akan memiliki berat sekitar 6 miliar ton.",
  "Tidak mungkin bersenandung sambil menahan hidung.",
  "Sidik jari koala sangat mirip dengan sidik jari manusia sehingga sering tertukar di tempat kejadian perkara.",
  "Madu tidak pernah basi. Madu yang dapat dimakan ditemukan di makam Mesir kuno.",
  "Jerapah tidak memiliki pita suara.",
  "Di Swiss, adalah ilegal untuk memiliki hanya satu kelinci percobaan karena mereka dianggap hewan sosial.",
  "Ada lebih banyak kemungkinan iterasi permainan catur daripada jumlah atom di alam semesta yang diketahui.",
  "Katak tidak bisa muntah. Jika harus, ia akan memuntahkan seluruh isi perutnya.",
];

const menuText = `
🤖 *Halo! Ini Menu Ajaib untuk Olah File* ✨

Pilih salah satu layanan di bawah ini, lalu kirimkan file yang sesuai:

0️⃣. *PDF* ➔ *Word*
    (via API Online)

1️⃣. *Word* ➔ *PDF*
    (via API Online, Kualitas Tinggi!)

2️⃣. *Foto* ➔ *Stiker*
    Buat stiker langsung dari fotomu.

3️⃣. *Foto* ➔ *Hapus Background*
    (via API Slazzer, Ringan & Cepat!)

4️⃣. *Gambar* ➔ *Ekstrak Teks (OCR)*
    Ambil semua tulisan dari dalam gambar.

5️⃣. *Gambar QR* ➔ *Baca QR Code*
    Lihat isi dari sebuah QR Code.

---
*Perintah Cepat & Santai:*
➡️ Ketik *!gempa* untuk info gempa terbaru.
➡️ Ketik *!fakta* untuk fakta unik baru.
➡️ Ketik *!qrcode <teks>* untuk membuat QR Code.
➡️ Tanya *"info ngopi kang?"*
➡️ Minta *"kata katane piye kang?"*
`;

const tempDir = path.join(__dirname, "temp");
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

const client = new Client({
  authStrategy: new LocalAuth({
    dataPath: "sessions",
  }),
  puppeteer: {
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--no-first-run",
      "--no-zygote",
      "--single-process",
      "--disable-gpu",
    ],
  },
});

console.log("🤖 Bot sedang dinyalakan...");

client.on("qr", async (qr) => {
  console.log("📱 QR Code diterima, mencoba menampilkannya...");

  qrcode_terminal.generate(qr, { small: true });
  console.log(
    "📱 Silakan coba scan QR Code di atas. Jika pecah, gunakan link di bawah ini."
  );

  try {
    const qrImage = await QRCode.toDataURL(qr);
    const base64Data = qrImage.replace(/^data:image\/png;base64,/, "");

    const formData = new FormData();
    formData.append("key", "6d207e02198a847aa98d0a2a901485a5");
    formData.append("action", "upload");
    formData.append("source", base64Data);
    formData.append("format", "json");

    const response = await axios.post(
      "https://freeimage.host/api/1/upload",
      formData,
      {
        headers: formData.getHeaders(),
      }
    );

    if (response.data.status_code === 200) {
      const imageUrl = response.data.image.url;
      console.log(
        "================================================================"
      );
      console.log(
        "‼️ JIKA QR DI ATAS PECAH, BUKA LINK INI DI BROWSER UNTUK SCAN:"
      );
      console.log(imageUrl);
      console.log(
        "================================================================"
      );
    }
  } catch (err) {
    console.error("Gagal membuat atau mengunggah link QR Code:", err.message);
  }
});

client.on("ready", () => {
  console.log("✅ Bot serbaguna siap beraksi!");
});

client.on("message", async (message) => {
  const user = message.from;
  const body = message.body;
  const lowerBody = body.toLowerCase();

  if (
    userChoices[user] &&
    userChoices[user].choice === "sticker_confirmation"
  ) {
    if (lowerBody === "ya" || lowerBody === "iya") {
      await message.reply("👍 Siap! Stiker sedang dibuat...");
      await client.sendMessage(user, userChoices[user].media, {
        sendMediaAsSticker: true,
        stickerAuthor: "Bot Ajaib ✨",
        stickerName: "BG Removed",
      });
    } else {
      await message.reply("Oke, dibatalkan. 👍");
    }
    delete userChoices[user];
    return;
  }
  if (lowerBody === "info ngopi kang?" || lowerBody === "inpo ngopi kang?") {
    await message.reply("hayu ngendi gasken 😎☕");
    return;
  }
  if (lowerBody === "kata katane piye kang?") {
    const randomIndex = Math.floor(Math.random() * JAVANESE_QUOTES.length);
    await message.reply(`_"${JAVANESE_QUOTES[randomIndex]}"_`);
    return;
  }
  if (lowerBody === "!gempa") {
    try {
      await message.reply("⏳ Sedang mencari info gempa terakhir dari BMKG...");
      const response = await axios.get(
        "https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json"
      );
      const gempa = response.data.Infogempa.gempa;
      const imageUrl = `https://data.bmkg.go.id/DataMKG/TEWS/${gempa.Shakemap}`;
      const imageMedia = await MessageMedia.fromUrl(imageUrl);
      const caption = `\n🚨 *Info Gempa Terbaru* 🚨\nWaktu: ${gempa.Tanggal}, ${gempa.Jam}\nKekuatan: *${gempa.Magnitude} SR*\nKedalaman: ${gempa.Kedalaman}\nLokasi: ${gempa.Lintang} - ${gempa.Bujur}\nWilayah: *${gempa.Wilayah}*\nPotensi: *${gempa.Potensi}*\n            `;
      await client.sendMessage(user, imageMedia, { caption: caption });
    } catch (err) {
      console.error("Error fetching earthquake info:", err);
      await message.reply("❌ Maaf, gagal mendapatkan info gempa dari BMKG.");
    }
    return;
  }
  if (lowerBody.startsWith("!qrcode ")) {
    try {
      const text = body.substring(8);
      if (!text) {
        await message.reply(
          "Teks untuk dijadikan QR Code tidak boleh kosong! Contoh: `!qrcode halo dunia`"
        );
        return;
      }
      await message.reply("⏳ Siap! QR Code sedang dibuat...");
      const qrDataUrl = await QRCode.toDataURL(text);
      const qrImage = new MessageMedia(
        "image/png",
        qrDataUrl.split(",")[1],
        "qrcode.png"
      );
      await client.sendMessage(user, qrImage, {
        caption: `Ini QR Code untuk teks:\n_"${text}"_`,
      });
    } catch (err) {
      console.error("Error creating QR Code:", err);
      await message.reply("❌ Maaf, gagal membuat QR Code.");
    }
    return;
  }
  if (lowerBody === "!fakta") {
    const randomIndex = Math.floor(Math.random() * FUN_FACTS.length);
    await message.reply(`*Tahukah Kamu?* 💡\n\n_${FUN_FACTS[randomIndex]}_`);
    return;
  }

  if (!message.hasMedia) {
    if (body === "!start") {
      delete userChoices[user];
      await message.reply(menuText);
      return;
    }
    if (body === "0") {
      userChoices[user] = { choice: "pdf_to_word" };
      await message.reply(
        "👍 Oke! Anda memilih *PDF ke Word*. Ditunggu file .pdf-nya ya..."
      );
      return;
    }
    if (body === "1") {
      userChoices[user] = { choice: "word_to_pdf" };
      await message.reply(
        "👍 Oke! Anda memilih *Word ke PDF*. Ditunggu file .docx-nya ya..."
      );
      return;
    }
    if (body === "2") {
      userChoices[user] = { choice: "photo_to_sticker" };
      await message.reply(
        "🖼️ Asyik! Anda memilih *Foto ke Stiker*. Kirim satu foto yang mau dijadikan stiker ya!"
      );
      return;
    }
    if (body === "3") {
      userChoices[user] = { choice: "remove_background" };
      await message.reply(
        "🎨 Mantap! Anda memilih *Hapus Background*. Kirim foto yang mau diedit ya!"
      );
      return;
    }
    if (body === "4") {
      userChoices[user] = { choice: "ocr" };
      await message.reply(
        "✍️ Oke! Anda memilih *Ekstrak Teks*. Kirim gambar yang ada tulisannya ya..."
      );
      return;
    }
    if (body === "5") {
      userChoices[user] = { choice: "read_qr" };
      await message.reply(
        "🔗 Siap! Anda memilih *Baca QR Code*. Kirim gambar QR Code-nya..."
      );
      return;
    }

    await message.reply(
      `Waduh, perintah "*${body}*" yang kamu masukkan salah atau tidak ada di menu. Ketik *!start* lagi ya! 🤔`
    );
    return;
  }

  if (message.hasMedia) {
    const userChoiceData = userChoices[user];
    if (!userChoiceData || !userChoiceData.choice) {
      await message.reply(
        "Eits, sebelum kirim file, pilih dulu mau konversi apa dengan ketik *!start* ya! 😉"
      );
      return;
    }
    const userChoice = userChoiceData.choice;

    const media = await message.downloadMedia();
    if (!media || !media.data) return;

    const timestamp = Date.now();

    try {
      if (userChoice === "pdf_to_word" || userChoice === "word_to_pdf") {
        if (
          !CONVERTAPI_SECRET ||
          CONVERTAPI_SECRET === "MASUKKAN_API_SECRET_ANDA_DISINI"
        ) {
          await message.reply(
            "❌ API Secret untuk ConvertAPI belum dimasukkan ke dalam kode! Fitur ini tidak bisa berjalan."
          );
          return;
        }

        const isPdfToWord = userChoice === "pdf_to_word";
        const fromFormat = isPdfToWord ? "pdf" : "docx";
        const toFormat = isPdfToWord ? "docx" : "pdf";

        if (
          (isPdfToWord && media.mimetype !== "application/pdf") ||
          (!isPdfToWord &&
            media.mimetype !==
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
        ) {
          await message.reply(
            "❌ Oops! File yang Anda kirim tidak sesuai dengan pilihan di menu. Coba lagi ya!"
          );
          return;
        }

        await message.reply(
          `🔄 Oke, file ${fromFormat.toUpperCase()} diterima! Mengirim ke server konversi online...`
        );

        const formData = new FormData();
        formData.append("file", Buffer.from(media.data, "base64"), {
          filename: `input.${fromFormat}`,
        });

        const response = await axios.post(
          `https://v2.convertapi.com/convert/${fromFormat}/to/${toFormat}?Secret=${CONVERTAPI_SECRET}`,
          formData,
          {
            headers: formData.getHeaders(),
          }
        );

        if (
          response.data &&
          response.data.Files &&
          response.data.Files[0] &&
          response.data.Files[0].Url
        ) {
          const fileUrl = response.data.Files[0].Url;
          const resultMedia = await MessageMedia.fromUrl(fileUrl, {
            unsafeMime: true,
          });
          resultMedia.filename = `${timestamp}.${toFormat}`;

          await client.sendMessage(user, resultMedia, {
            caption: `Taraa! ✨ Ini dia file ${toFormat.toUpperCase()} kamu, dikonversi via API.`,
          });
        } else {
          throw new Error(
            "Respons dari ConvertAPI tidak berisi URL file yang valid."
          );
        }
      } else if (
        userChoice === "photo_to_sticker" &&
        media.mimetype.startsWith("image/")
      ) {
        await message.reply(
          "✨ Siap! Fotonya lagi dibikin jadi stiker. Tunggu sebentar..."
        );
        await client.sendMessage(user, media, {
          sendMediaAsSticker: true,
          stickerAuthor: "Bot Ajaib ✨",
          stickerName: "Buatan Kamu",
        });
      } else if (
        userChoice === "remove_background" &&
        media.mimetype.startsWith("image/")
      ) {
        // =========================================================================
        // DIUBAH TOTAL: Menggunakan API Slazzer yang ringan untuk menghindari 'Killed'
        // =========================================================================
        if (
          !SLAZZER_API_KEY ||
          SLAZZER_API_KEY === "MASUKKAN_API_KEY_SLAZZER_ANDA_DISINI"
        ) {
          await message.reply(
            "❌ API Key untuk Slazzer belum dimasukkan ke dalam kode! Fitur ini tidak bisa berjalan."
          );
          return;
        }
        await message.reply(
          "🪄 Ajaib! Fotonya lagi dikirim ke server Slazzer, mohon tunggu..."
        );

        const formData = new FormData();
        formData.append(
          "source_image_file",
          Buffer.from(media.data, "base64"),
          {
            filename: "input_image.jpg",
          }
        );

        const response = await axios({
          method: "post",
          url: "https://api.slazzer.com/v2.0/remove_image",
          data: formData,
          responseType: "arraybuffer",
          headers: {
            ...formData.getHeaders(),
            "API-KEY": SLAZZER_API_KEY,
          },
        });

        const newMedia = new MessageMedia(
          "image/png",
          Buffer.from(response.data).toString("base64"),
          "background-removed.png"
        );
        await client.sendMessage(user, newMedia, {
          caption: "Ini dia fotonya dengan background transparan! ✨",
        });
        await message.reply(
          "Mau langsung dijadikan stiker? Balas *ya* jika mau."
        );
        userChoices[user] = { choice: "sticker_confirmation", media: newMedia };
        return;
      } else if (userChoice === "ocr" && media.mimetype.startsWith("image/")) {
        await message.reply(
          "✍️ Sedang membaca tulisan di gambarmu... Ini mungkin butuh waktu sedikit lebih lama."
        );
        const imageBuffer = Buffer.from(media.data, "base64");
        const {
          data: { text },
        } = await Tesseract.recognize(imageBuffer, "eng+ind", {
          logger: (m) => console.log(m),
        });
        await message.reply(
          `*--- Hasil Pembacaan Teks ---*\n\n${
            text || "Tidak ada teks yang bisa dibaca."
          }`
        );
      } else if (
        userChoice === "read_qr" &&
        media.mimetype.startsWith("image/")
      ) {
        await message.reply("🔍 Memindai QR Code...");
        const imageBuffer = Buffer.from(media.data, "base64");
        const image = await loadImage(imageBuffer);
        const canvas = createCanvas(image.width, image.height);
        const ctx = canvas.getContext("2d");
        ctx.drawImage(image, 0, 0, image.width, image.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code) {
          await message.reply(
            `✅ QR Code berhasil dibaca!\n\n*Isinya adalah:*\n${code.data}`
          );
        } else {
          await message.reply(
            "❌ Gagal membaca QR Code. Coba gambar yang lebih jelas ya."
          );
        }
      } else {
        await message.reply(
          "❌ Oops! File yang Anda kirim tidak sesuai dengan pilihan di menu. Coba lagi ya!"
        );
        delete userChoices[user];
        return;
      }
    } catch (err) {
      console.error("--- TERJADI KESALAHAN DETAIL ---");
      if (err.response) {
        console.error("Status Code:", err.response.status);
        console.error(
          "Pesan Error dari Server:",
          JSON.stringify(err.response.data, null, 2)
        );
        await message.reply(
          `❌ Gagal! Server memberikan error: ${
            err.response.data.Error || "Masalah pada API"
          }. Mohon periksa API Key Anda.`
        );
      } else {
        console.error("Error Umum:", err.message);
        await message.reply(
          `❌ Aduh, maaf! Terjadi error: ${err.message}. Coba lagi nanti ya.`
        );
      }
      console.error("--- AKHIR DARI DETAIL KESALAHAN ---");
    }

    if (
      userChoices[user] &&
      userChoices[user].choice !== "sticker_confirmation"
    ) {
      delete userChoices[user];
      console.log(`Pembersihan dan reset state untuk user ${user} selesai.`);
    }
  }
});

client.initialize();
