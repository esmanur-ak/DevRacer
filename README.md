<div align="center">

# ⚡ DevRacer

**Kod yazma hızını arkadaşlarınla yarıştığın, gerçek zamanlı çok oyunculu tip yarışı oyunu.**

[🎮 OYNAMAK İÇİN :  Canlı Demo](https://devracer-game.netlify.app/) · [🐛 Hata Bildir](https://github.com/esmanur-ak/DevRacer/issues)

</div>


---
<img width="946" height="2048" alt="WhatsApp Image 2026-08-30 at 17 21 04" src="https://github.com/user-attachments/assets/41cc4aef-8168-4f63-ae98-abde0bb612b2" />

## 🎮 Proje Hakkında

**DevRacer**, kullanıcıların farklı programlama dillerinde kod parçacıklarını en hızlı ve en az hatayla yazmaya çalıştığı, tarayıcı üzerinde çalışan bir "code typing race" oyunudur. Tek başına pratik yapabilir ya da oda kodu oluşturup arkadaşlarını davet ederek canlı olarak yarışabilirsin.

## ✨ Özellikler

- 🕹️ **Solo Mod** — kendi rekorunu kırmaya çalış
- 👥 **Arkadaş Modu** — oda oluştur, davet linkini paylaş, aynı odada en fazla 5 kişiyle yarış (PeerJS ile P2P bağlantı)
- 💻 **Çoklu dil desteği** — JavaScript, Python, C++, HTML/CSS, C#, Java veya karışık mod
- 🔥 **Zorluk seviyeleri** — kolay, orta, zor
- 🏆 **Maç serisi seçenekleri** — tek maç, Best of 3, Best of 5
- 📊 **Canlı istatistikler** — süre, CPM (dakikadaki karakter sayısı) ve hata sayısı
- 👑 **Günün Enleri** — günlük liderlik kürsüsü
- 🙋 **Özelleştirilebilir profil** — oyuncu adı ve avatar seçimi
- ⚔️ **Rövanş isteği** ve maç sonu hızlı tepki gönderme (emoji reaksiyonları)
- 🌍 **Çok dilli arayüz** — Türkçe / İngilizce
- 🍪 **Çerez tercihleri paneli**

## 🛠️ Kullanılan Teknolojiler

- **HTML5 & CSS3**
- **Vanilla JavaScript**
- **[PeerJS](https://peerjs.com/)** — WebRTC tabanlı gerçek zamanlı çok oyunculu bağlantı
- **Netlify** — canlı yayın (deployment)

## 📁 Proje Yapısı

```
DevRacer/
├── index.html        # Ana sayfa ve oyun arayüzü
├── theme.css         # Genel tema ve renk stilleri
├── profile.css        # Profil ve lobi ekranı stilleri
├── race.css           # Yarış ekranı stilleri
├── app.js             # Oyun mantığı (solo mod, istatistikler, vb.)
├── database.js        # Kod parçacıkları / veri yönetimi
└── multiplayer.js     # PeerJS tabanlı çok oyunculu mantık
```

## 🚀 Kurulum

```bash
git clone https://github.com/esmanur-ak/DevRacer.git
cd DevRacer
```

Proje herhangi bir build aracı gerektirmez; `index.html` dosyasını doğrudan tarayıcıda açabilir veya VS Code **Live Server** gibi basit bir local sunucu ile çalıştırabilirsin.

## 🎯 Nasıl Oynanır

1. Oyuncu profilini oluştur (isim ve avatar seç)
2. Yarışılacak programlama dilini, zorluk seviyesini ve maç serisini seç
3. **Solo Mod**'da kendi rekorunu kır ya da **Arkadaş Modu**'nda oda açıp davet kodunu paylaş
4. Ekranda beliren kodu en hızlı ve en az hatayla yaz
5. Sonuçlarını gör; rövanş iste, tekrar dene ya da skorunu arkadaşınla paylaş
<img width="1897" height="912" alt="Ekran görüntüsü 2026-08-30 171330" src="https://github.com/user-attachments/assets/978b05e0-9d3b-4f3c-9c9d-d21c45f02c02" />

## 👩‍💻 Geliştirici

**Esmanur AK**
[LinkedIn](https://www.linkedin.com/in/esmanur-ak-b867a4385) · [GitHub](https://github.com/esmanur-ak)

## 📄 Lisans

Bu proje eğitim/portföy amaçlı geliştirilmiştir.
