# Derya Aslı Tugay'ın Web Frontend Görevleri
**Front-end Test Videosu:** [Link](https://youtu.be/P_lexPmsF00)

## 1. Üye Olma (Kayıt) Sayfası
- **API Endpoint:** `POST /api/register`
- **Görev:** Kullanıcı kayıt işlemi için web sayfası tasarımı ve implementasyonu
- **UI Bileşenleri:**
  - Responsive kayıt formu
  - Ad input alanı (`name`)
  - Kimlik numarası input alanı (`IDnumber`)
  - Rol seçim alanı (`doctor` / `patient`)
  - Şifre input alanı (`password`)
  - "Kayıt Ol" butonu
  - "Zaten hesabınız var mı? Giriş Yap" yönlendirmesi
  - Loading durumu göstergesi
  - Hata mesajı alanı
- **Form Validasyonu:**
  - Tüm alanlar zorunludur
  - Kimlik numarası boş bırakılamaz
  - Şifre boş bırakılamaz
  - Rol seçimi yapılmalıdır
  - Client-side ve server-side validation uygulanır
- **Kullanıcı Deneyimi:**
  - Başarılı kayıt sonrası token kaydedilir
  - Kullanıcı ilaçlar sayfasına yönlendirilir
  - Hata durumlarında kullanıcı dostu mesaj gösterilir
- **Teknik Detaylar:**
  - React ile geliştirildi
  - State management için `useState` kullanıldı
  - API istekleri `axios` ile yapıldı
  - Routing için `react-router-dom` kullanıldı

---

## 2. Giriş Yapma Sayfası
- **API Endpoint:** `POST /api/login`
- **Görev:** Kullanıcı giriş işlemi için web sayfası tasarımı ve implementasyonu
- **UI Bileşenleri:**
  - Responsive giriş formu
  - Kimlik numarası input alanı (`IDnumber`)
  - Şifre input alanı (`password`)
  - "Giriş Yap" butonu
  - Loading durumu göstergesi
  - Hata mesajı alanı
- **Form Validasyonu:**
  - Kimlik numarası ve şifre alanları zorunludur
  - Boş alan gönderimi engellenir
- **Kullanıcı Deneyimi:**
  - Başarılı giriş sonrası JWT token localStorage’a kaydedilir
  - Kullanıcı ilaçlar sayfasına yönlendirilir
  - Hatalı girişte kullanıcıya hata mesajı gösterilir
- **Teknik Detaylar:**
  - React ile geliştirildi
  - `axios` ile backend’e istek atıldı
  - `localStorage` ile token saklandı
  - `ProtectedRoute` yapısı ile korumalı sayfa geçişi sağlandı

---

## 3. Ana Sayfa
- **Görev:** Sistemin giriş noktası olan ana sayfanın tasarımı ve implementasyonu
- **UI Bileşenleri:**
  - Uygulama başlığı
  - Sistem açıklama metni
  - Kullanıcı giriş yapmışsa kullanıcı adı ve rol bilgisi
  - "İlaçlara Git" ve "Reçetelere Git" bağlantıları
  - Giriş yapılmamışsa "Giriş Yap" ve "Kayıt Ol" bağlantıları
- **Kullanıcı Deneyimi:**
  - Kullanıcının giriş durumuna göre farklı içerik gösterilir
  - Basit ve anlaşılır yönlendirme sağlanır

---

## 4. Navbar Bileşeni
- **Görev:** Uygulama genelinde gezinme sağlayan üst menü bileşeninin tasarımı ve implementasyonu
- **UI Bileşenleri:**
  - Ana sayfa bağlantısı
  - İlaçlar sayfası bağlantısı
  - Reçeteler sayfası bağlantısı
  - Giriş yap / kayıt ol bağlantıları
  - Çıkış yap butonu
  - Giriş yapan kullanıcının adı ve rolü
- **Kullanıcı Deneyimi:**
  - Giriş durumuna göre içerik değişir
  - Çıkış yapıldığında token silinir ve kullanıcı giriş sayfasına yönlendirilir

---

## 5. İlaç Listeleme Sayfası
- **API Endpoint:** `GET /api/medications`
- **Görev:** Sistemde kayıtlı ilaçların listelenmesini sağlayan sayfanın tasarımı ve implementasyonu
- **UI Bileşenleri:**
  - Sayfa başlığı
  - Giriş yapan kullanıcı bilgisi
  - İlaç tablosu
  - İlaç adı sütunu
  - Son kullanma tarihi sütunu
  - Kutu içi adet sütunu
  - Kutu sayısı sütunu
  - Toplam adet sütunu
  - Düzenle ve sil butonları
- **Kullanıcı Deneyimi:**
  - Tüm ilaçlar tablo halinde görüntülenir
  - Toplam adet bilgisi otomatik hesaplanır
  - Veri yoksa bilgilendirme mesajı gösterilir

---

## 6. İlaç Ekleme Formu
- **API Endpoint:** `POST /api/medications`
- **Görev:** Yeni ilaç ekleme formunun tasarımı ve implementasyonu
- **UI Bileşenleri:**
  - İlaç adı input alanı
  - Son kullanma tarihi input alanı
  - Kutu içi adet input alanı
  - Kutu sayısı input alanı
  - "İlaç Ekle" butonu
- **Form Validasyonu:**
  - Tüm alanlar zorunludur
  - Kutu içi adet en az 1 olmalıdır
  - Kutu sayısı en az 1 olmalıdır
- **Kullanıcı Deneyimi:**
  - Başarılı ekleme sonrası form temizlenir
  - Liste otomatik yenilenir
  - Hata durumunda kullanıcıya mesaj gösterilir

---

## 7. İlaç Güncelleme
- **API Endpoint:** `PUT /api/medications/{medicationId}`
- **Görev:** Var olan ilaç bilgisini düzenleme akışının tasarımı ve implementasyonu
- **UI Bileşenleri:**
  - Seçilen ilacın bilgilerinin forma doldurulması
  - "Güncelle" butonu
  - "Düzenlemeyi İptal Et" butonu
- **Kullanıcı Deneyimi:**
  - Kullanıcı seçtiği ilacı düzenleyebilir
  - Güncelleme sonrası liste yenilenir
  - Düzenleme iptal edilebilir

---

## 8. İlaç Silme
- **API Endpoint:** `DELETE /api/medications/{medicationId}`
- **Görev:** Var olan ilacı silme işleminin implementasyonu
- **UI Bileşenleri:**
  - Her ilaç satırında "Sil" butonu
- **Kullanıcı Deneyimi:**
  - İlaç silindikten sonra liste güncellenir
  - Hata durumunda kullanıcı bilgilendirilir

---

## 9. Reçete Listeleme Sayfası
- **API Endpoint:** `GET /api/prescriptions`
- **Görev:** Sistemde kayıtlı reçetelerin listelenmesini sağlayan sayfanın tasarımı ve implementasyonu
- **UI Bileşenleri:**
  - Reçeteler tablosu
  - Patient ID sütunu
  - Doctor ID sütunu
  - Tarih sütunu
  - Talimat sütunu
  - İlaç sayısı sütunu
  - "Gör" butonu
  - Doktor için "Düzenle" ve "Sil" butonları
- **Kullanıcı Deneyimi:**
  - Giriş yapan kullanıcının rolüne göre reçeteler filtrelenir
  - Patient yalnızca kendi reçetelerini görür
  - Doctor yalnızca kendi yazdığı reçeteleri görür

---

## 10. Reçete Ekleme Formu
- **API Endpoint:** `POST /api/prescriptions`
- **Görev:** Yeni reçete ekleme formunun tasarımı ve implementasyonu
- **UI Bileşenleri:**
  - Patient ID input alanı
  - Doctor ID input alanı
  - Tarih input alanı
  - Talimat textarea alanı
  - "Reçete Oluştur" butonu
- **Kullanıcı Deneyimi:**
  - Bu form sadece doctor rolündeki kullanıcıya gösterilir
  - Doctor ID alanı otomatik doldurulur
  - Reçete oluşturulduktan sonra liste güncellenir

---

## 11. Reçete Güncelleme
- **API Endpoint:** `PUT /api/prescriptions/{prescriptionId}`
- **Görev:** Var olan reçete bilgisini düzenleme akışının tasarımı ve implementasyonu
- **UI Bileşenleri:**
  - Reçete bilgilerinin forma doldurulması
  - "Reçeteyi Güncelle" butonu
  - "Düzenlemeyi İptal Et" butonu
- **Kullanıcı Deneyimi:**
  - Sadece doctor rolündeki kullanıcı düzenleme yapabilir
  - Güncelleme sonrası reçete listesi yenilenir

---

## 12. Reçete Silme
- **API Endpoint:** `DELETE /api/prescriptions/{prescriptionId}`
- **Görev:** Var olan reçeteyi silme işleminin implementasyonu
- **UI Bileşenleri:**
  - Her reçete satırında doctor için "Sil" butonu
- **Kullanıcı Deneyimi:**
  - Sadece doctor rolündeki kullanıcı reçete silebilir
  - Silme sonrası liste güncellenir

---

## 13. Reçete Detay Görüntüleme
- **API Endpoint:** `GET /api/prescriptions/{prescriptionId}`
- **Görev:** Seçilen reçetenin detaylı görüntülenmesini sağlayan alanın tasarımı ve implementasyonu
- **UI Bileşenleri:**
  - Patient ID bilgisi
  - Doctor ID bilgisi
  - Tarih bilgisi
  - Talimat bilgisi
  - Reçetedeki ilaçlar listesi
- **Kullanıcı Deneyimi:**
  - "Gör" butonuna basıldığında reçete detayı yüklenir
  - Kullanıcı yalnızca kendi erişim yetkisi olan reçeteleri görüntüleyebilir

---

## 14. Reçeteye İlaç Ekleme
- **API Endpoint:** `POST /api/prescriptions/{prescriptionId}/medications`
- **Görev:** Seçili reçeteye ilaç ekleme formunun tasarımı ve implementasyonu
- **UI Bileşenleri:**
  - İlaç adı input alanı
  - Son kullanma tarihi input alanı
  - Kutu içi adet input alanı
  - Kutu sayısı input alanı
  - "İlacı Ekle" butonu
- **Kullanıcı Deneyimi:**
  - Bu form sadece doctor rolündeki kullanıcıya gösterilir
  - İlaç eklendikten sonra reçete detayı ve liste güncellenir

---

## 15. Reçetedeki İlaçları Listeleme
- **API Endpoint:** `GET /api/prescriptions/{prescriptionId}/medications`
- **Görev:** Seçilen reçete içindeki ilaçların görüntülenmesini sağlayan bileşenin tasarımı ve implementasyonu
- **UI Bileşenleri:**
  - İlaç adı sütunu
  - Son kullanma tarihi sütunu
  - Kutu içi adet sütunu
  - Kutu sayısı sütunu
  - Toplam adet sütunu
  - Doctor için sil butonu
- **Kullanıcı Deneyimi:**
  - Reçetedeki tüm ilaçlar tablo halinde gösterilir
  - Patient kullanıcı sadece görüntüleyebilir
  - Doctor kullanıcı ilaç silebilir

---

## 16. Reçetedeki İlacı Silme
- **API Endpoint:** `DELETE /api/prescriptions/{prescriptionId}/medications/{medicationId}`
- **Görev:** Reçete içindeki bir ilacı silme işleminin implementasyonu
- **UI Bileşenleri:**
  - Reçete içindeki her ilaç satırında doctor için "Sil" butonu
- **Kullanıcı Deneyimi:**
  - Sadece doctor rolündeki kullanıcı silebilir
  - Silme sonrası reçete detayı güncellenir

---

## 17. Rol Bazlı Arayüz ve Yetkilendirme
- **Görev:** Kullanıcının rolüne göre farklı ekran ve işlem yetkileri sunan frontend akışının tasarımı ve implementasyonu
- **Kurallar:**
  - `doctor` → reçete oluşturabilir, düzenleyebilir, silebilir, reçeteye ilaç ekleyebilir ve silebilir
  - `patient` → sadece kendi reçetelerini görüntüleyebilir
- **Teknik Detaylar:**
  - JWT payload içinden kullanıcı rolü okunur
  - `ProtectedRoute` ve `RoleGuard` yapıları kullanılır
  - `localStorage` üzerinden oturum bilgisi yönetilir

---

## 18. Çıkış Yapma İşlemi
- **Görev:** Kullanıcının sistemden güvenli şekilde çıkış yapmasını sağlayan akışın implementasyonu
- **UI Bileşenleri:**
  - Navbar içinde "Çıkış Yap" butonu
- **Kullanıcı Deneyimi:**
  - Token localStorage’dan silinir
  - Kullanıcı giriş sayfasına yönlendirilir