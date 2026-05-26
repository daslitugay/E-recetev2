# Derya Aslı Tugay'ın REST API Metotları

**API Test Videosu:** [Link](https://youtu.be/mCTkSXwZvfs)

## 1. Üye Olma
- **Endpoint:** `POST /api/register`
- **Request Body:** 
```json
{
  "name": "Derya Aslı Tugay",
  "IDnumber": "12345678901",
  "role": "patient",
  "password": "Guvenli123!"
}
```
- **Response:** `200 OK`  
Kullanıcı başarıyla oluşturulur ve JWT token döndürülür.

---

## 2. Giriş Yapma
- **Endpoint:** `POST /api/login`
- **Request Body:** 
```json
{
  "IDnumber": "12345678901",
  "password": "Guvenli123!"
}
```
- **Response:** `200 OK`  
Giriş başarılı, JWT token döndürülür.

---

## 3. İlaç Listeleme
- **Endpoint:** `GET /api/medications`
- **Response:** `200 OK`  
Tüm ilaçlar listelenir.

---

## 4. Tek İlaç Görüntüleme
- **Endpoint:** `GET /api/medications/{medicationId}`
- **Path Parameter:**
  - `medicationId` → İlacın ID’si
- **Response:** `200 OK`

---

## 5. İlaç Ekleme
- **Endpoint:** `POST /api/medications`
- **Request Body:**
```json
{
  "name": "Parol",
  "expirationDate": "2026-12-31T00:00:00.000Z",
  "unitsPerBox": 20,
  "boxCount": 2
}
```
- **Response:** `201 Created`

---

## 6. İlaç Güncelleme
- **Endpoint:** `PUT /api/medications/{medicationId}`
- **Request Body:**
```json
{
  "name": "Parol Plus",
  "expirationDate": "2027-01-31T00:00:00.000Z",
  "unitsPerBox": 24,
  "boxCount": 1
}
```
- **Response:** `200 OK`

---

## 7. İlaç Silme
- **Endpoint:** `DELETE /api/medications/{medicationId}`
- **Response:** `200 OK`

---

## 8. Reçete Listeleme
- **Endpoint:** `GET /api/prescriptions`
- **Response:** `200 OK`

---

## 9. Tek Reçete Görüntüleme
- **Endpoint:** `GET /api/prescriptions/{prescriptionId}`
- **Response:** `200 OK`

---

## 10. Reçete Ekleme
- **Endpoint:** `POST /api/prescriptions`
- **Request Body:**
```json
{
  "patientId": "12345678901",
  "doctorId": "98765432100",
  "medications": [],
  "datePrescribed": "2026-03-01T00:00:00.000Z",
  "instructions": "Tok karnına günde 2 kez kullanınız."
}
```
- **Response:** `201 Created`

---

## 11. Reçete Güncelleme
- **Endpoint:** `PUT /api/prescriptions/{prescriptionId}`
- **Request Body:**
```json
{
  "patientId": "12345678901",
  "doctorId": "98765432100",
  "medications": [],
  "datePrescribed": "2026-03-02T00:00:00.000Z",
  "instructions": "Yemekten sonra kullanılmalıdır."
}
```
- **Response:** `200 OK`

---

## 12. Reçete Silme
- **Endpoint:** `DELETE /api/prescriptions/{prescriptionId}`
- **Response:** `200 OK`

---

## 13. Reçetedeki İlaçları Listeleme
- **Endpoint:** `GET /api/prescriptions/{prescriptionId}/medications`
- **Response:** `200 OK`

---

## 14. Reçeteye İlaç Ekleme
- **Endpoint:** `POST /api/prescriptions/{prescriptionId}/medications`
- **Request Body:**
```json
{
  "name": "Parol",
  "expirationDate": "2026-12-31T00:00:00.000Z",
  "unitsPerBox": 20,
  "boxCount": 2
}
```
- **Response:** `201 Created`

---

## 15. Reçetedeki Tek İlacı Görüntüleme
- **Endpoint:** `GET /api/prescriptions/{prescriptionId}/medications/{medicationId}`
- **Response:** `200 OK`

---

## 16. Reçetedeki İlacı Güncelleme
- **Endpoint:** `PUT /api/prescriptions/{prescriptionId}/medications/{medicationId}`
- **Request Body:**
```json
{
  "name": "Parol Forte",
  "expirationDate": "2027-01-31T00:00:00.000Z",
  "unitsPerBox": 24,
  "boxCount": 1
}
```
- **Response:** `200 OK`

---

## 17. Reçetedeki İlacı Silme
- **Endpoint:** `DELETE /api/prescriptions/{prescriptionId}/medications/{medicationId}`
- **Response:** `200 OK`

---

## Notlar
- API şu an JWT üretmektedir ancak tüm endpoint’lerde zorunlu olarak kullanılmamaktadır.
- Kullanıcı rolleri: `doctor` ve `patient`
- Patient → kendi reçetelerini görür  
- Doctor → kendi yazdığı reçeteleri görür
