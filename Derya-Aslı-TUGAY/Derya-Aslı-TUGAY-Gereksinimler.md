1. **Üye Olma**
   - **API Metodu:** `POST /api/register`
   - **Açıklama:** Kullanıcıların sisteme yeni hesap oluşturarak kayıt olmasını sağlar. Kullanıcı kayıt olurken ad, kimlik numarası (`IDnumber`), rol (`doctor` veya `patient`) ve şifre bilgilerini girer. Başarılı kayıt işleminden sonra kullanıcı için JWT token üretilir.

2. **Giriş Yapma**
   - **API Metodu:** `POST /api/login`
   - **Açıklama:** Kullanıcıların sisteme giriş yapmasını sağlar. Kullanıcı kimlik numarası (`IDnumber`) ve şifre bilgilerini girerek giriş yapar. Başarılı giriş işleminden sonra kullanıcıya JWT token döndürülür.

3. **İlaç Ekleme**
   - **API Metodu:** `POST /api/medications`
   - **Açıklama:** Sisteme yeni bir ilaç kaydı eklenmesini sağlar. Kullanıcı ilaç adı, son kullanma tarihi, kutu içindeki adet sayısı ve kutu sayısı bilgilerini girerek ilacı kayıt altına alabilir. Bu sayede dijital ilaç dolabı oluşturulur.

4. **İlaç Bilgilerini Değiştirme**
   - **API Metodu:** `PUT /api/medications/{medicationId}`
   - **Açıklama:** Sistemde kayıtlı bir ilacın bilgilerinin güncellenmesini sağlar. Kullanıcı ilaç adı, son kullanma tarihi, kutu içindeki adet sayısı veya kutu sayısı gibi bilgileri değiştirebilir.

5. **İlaç Silme**
   - **API Metodu:** `DELETE /api/medications/{medicationId}`
   - **Açıklama:** Sistemde kayıtlı bir ilacın silinmesini sağlar. Artık kullanılmayan veya elde bulunmayan ilaçlar sistemden kaldırılabilir.

6. **İlaç Görüntüleme**
   - **API Metodu:** `GET /api/medications/{medicationId}`
   - **Açıklama:** Sistemde kayıtlı bir ilacın detaylı bilgilerinin görüntülenmesini sağlar. Kullanıcı ilacın adı, son kullanma tarihi, kutu içindeki adet sayısı ve kutu sayısı gibi bilgileri inceleyebilir.

7. **İlaç Listeleme**
   - **API Metodu:** `GET /api/medications`
   - **Açıklama:** Sistemde kayıtlı tüm ilaçların listelenmesini sağlar. Kullanıcı eklenen ilaçları toplu şekilde görüntüleyebilir ve ilaç stoğunu takip edebilir.

8. **Reçete Ekleme**
   - **API Metodu:** `POST /api/prescriptions`
   - **Açıklama:** Sisteme yeni bir reçete eklenmesini sağlar. Reçete kaydı hasta kimliği (`patientId`), doktor kimliği (`doctorId`), reçete tarihi, kullanım talimatı ve ilaç bilgileri ile oluşturulur.

9. **Reçete Bilgilerini Değiştirme**
   - **API Metodu:** `PUT /api/prescriptions/{prescriptionId}`
   - **Açıklama:** Sistemde kayıtlı bir reçetenin bilgilerinin güncellenmesini sağlar. Hasta bilgisi, doktor bilgisi, reçete tarihi veya kullanım talimatı gibi alanlar değiştirilebilir.

10. **Reçete Silme**
   - **API Metodu:** `DELETE /api/prescriptions/{prescriptionId}`
   - **Açıklama:** Sistemde kayıtlı bir reçetenin silinmesini sağlar. Artık geçerli olmayan veya kullanılmayan reçeteler sistemden kaldırılabilir.

11. **Reçete Görüntüleme**
   - **API Metodu:** `GET /api/prescriptions/{prescriptionId}`
   - **Açıklama:** Sistemde kayıtlı bir reçetenin detaylı şekilde görüntülenmesini sağlar. Kullanıcı reçeteye ait hasta kimliği, doktor kimliği, tarih, talimat ve ilaç bilgilerini inceleyebilir.

12. **Reçete Listeleme**
   - **API Metodu:** `GET /api/prescriptions`
   - **Açıklama:** Sistemde kayıtlı tüm reçetelerin listelenmesini sağlar. Kullanıcı reçeteleri toplu şekilde görüntüleyebilir.

13. **Reçeteye İlaç Ekleme**
   - **API Metodu:** `POST /api/prescriptions/{prescriptionId}/medications`
   - **Açıklama:** Var olan bir reçeteye yeni ilaç eklenmesini sağlar. Reçeteye eklenen ilaç adı, son kullanma tarihi, kutu içindeki adet sayısı ve kutu sayısı bilgileriyle birlikte kaydedilir.

14. **Reçetedeki İlaçları Listeleme**
   - **API Metodu:** `GET /api/prescriptions/{prescriptionId}/medications`
   - **Açıklama:** Belirli bir reçete içinde bulunan tüm ilaçların listelenmesini sağlar. Kullanıcı reçetede yer alan ilaçları toplu şekilde görüntüleyebilir.

15. **Reçetedeki İlacı Görüntüleme**
   - **API Metodu:** `GET /api/prescriptions/{prescriptionId}/medications/{medicationId}`
   - **Açıklama:** Belirli bir reçete içindeki tek bir ilacın görüntülenmesini sağlar. Kullanıcı ilgili ilacın detaylarını inceleyebilir.

16. **Reçetedeki İlacı Güncelleme**
   - **API Metodu:** `PUT /api/prescriptions/{prescriptionId}/medications/{medicationId}`
   - **Açıklama:** Belirli bir reçete içinde kayıtlı olan ilacın bilgilerinin güncellenmesini sağlar. İlaç adı, son kullanma tarihi, kutu içindeki adet sayısı ve kutu sayısı değiştirilebilir.

17. **Reçetedeki İlacı Silme**
   - **API Metodu:** `DELETE /api/prescriptions/{prescriptionId}/medications/{medicationId}`
   - **Açıklama:** Belirli bir reçete içinde yer alan ilacın silinmesini sağlar. Böylece reçete içeriği güncellenebilir.