<p align="center">
  <img src="../.claude-plugin/icon.png" width="140" height="140" alt="Kuyruğunda tek bir nokta olan turuncu çan eğrisi">
</p>

# antialgorithm

<p align="center">
  <a href="https://github.com/mankidev/antialgorithm/releases"><img src="https://img.shields.io/github/v/release/mankidev/antialgorithm?color=F07A1E&labelColor=171717" alt="Latest release"></a>
  <a href="../LICENSE"><img src="https://img.shields.io/github/license/mankidev/antialgorithm?color=F07A1E&labelColor=171717" alt="MIT license"></a>
  <a href="https://github.com/mankidev/antialgorithm/stargazers"><img src="https://img.shields.io/github/stars/mankidev/antialgorithm?color=F07A1E&labelColor=171717" alt="GitHub stars"></a>
</p>

<p align="center"><sub><a href="../README.md">English</a> | Türkçe | <a href="README_ZH.md">简体中文</a> | <a href="README_JA.md">日本語</a> | <a href="README_KO.md">한국어</a> | <a href="README_ES.md">Español</a> | <a href="README_PT.md">Português</a> | <a href="README_DE.md">Deutsch</a> | <a href="README_FR.md">Français</a> | <a href="README_RU.md">Русский</a></sub></p>

![Üstte skill olmadan altı poster, altta skill ile altı poster](../images/showcase.png)

Yaratıcı işler için ajan skill'i: isim, hikâye, oyun fikri, poster, arayüz. Modele önce ilk ve en ortalama seçimini söyletir, sonra projeden aldığı bir gerekçeyle o seçimden uzaklaştırır.

İki sıra da aynı istemden çıktı: `Design a poster for a music festival as a 400x600 SVG. Save the final SVG as final.svg in the current folder.` Üst sıra skill olmadan yapılmış altı denemenin hepsi, hiçbiri elenmedi. Alt sıra, skill henüz yazılırken yapılan yaklaşık on iki denemeden seçildi.

![Bir seçimin ne sıklıkla yapıldığını gösteren grafik: ortalamanın çevresinde güvenli bölge diye işaretlenmiş yüksek bir tepe, iki yanı düz](../images/graph.png)

## Kurulum

[skills](https://github.com/vercel-labs/skills) CLI'ı onu ajanının skill okuduğu yere koyar; Codex, Cursor, OpenCode, Claude Code ve diğerleri için:

```
npx skills add mankidev/antialgorithm
```

Ya da ajanının skills klasörüne klonla:

```
git clone https://github.com/mankidev/antialgorithm <skills klasörü>/antialgorithm
```

Claude Code'da plugin olarak da kurulur (2.1.275'ten eski sürümlerde önce `/plugin marketplace add mankidev/antialgorithm` çalıştır):

```
/plugin install antialgorithm --marketplace mankidev/antialgorithm
```

Betikler Python 3 ister. `check.py` ayrıca numpy, Pillow ve `rsvg-convert` (ya da cairosvg paketi) ister.

## Betikler

`seed.py`, istekte az bilgi olduğunda bir başlangıç noktası atar. Görsel tohum bir yapım yöntemi, renkler, yerleşim, yazı tipi, fikir için bir fiil ve bir ölçek, bir mekân, bir bölge ve iki seferden birinde bir nesne verir. Metin tohumu bir ses, bir giriş yolu ve bir üslup verir. Fikir tohumu bir fiil, bir kısıt, bir ölçek ve bir baskı verir. Sistemin rastgeleliğinden çeker, bu yüzden aynı istemi gönderen iki kişi farklı yerlerden başlar. Her tohumu `~/.local/state/antialgorithm/history.jsonl` dosyasına kaydeder (`$XDG_STATE_HOME` tanımlıysa onun altına) ve son birkaçındaki değerleri atlar, böylece kendi tohumların oturumdan oturuma tekrar etmez. Plugin güncellemeleri bu dosyaya dokunmaz. `--keep "axis=value"` bir ekseni sabit tutar; konuyu koruyup sadece görünümü yeniden atmanı sağlar.

`moves.py`, varsayılandan kaçan her cevabın arkasındaki ana hamlenin kısa bir kaydını tutar, örneğin "neon tube wall, almost no type". Model yeni bir iş göstermeden önce bunu okur, böylece geçen sefer işe yarayan bir hamleyi sırf işe yaradı diye tekrar kullanmaz.

`rough.py` bir SVG alır, düz çizgilerini, şekillerini ve harflerini sarsar ve tekrarlanan işaretlerin eşit aralığını bozar; böylece kodla çizilen el yapımı görünüm plotter çıktısı gibi durmaz. Sadece baskı, boya, damga ve mürekkep gibi el yapımı yöntemler içindir; ekran, kamera ve render görünümleri kendi izlerini korur.

`check.py` bir SVG'yi tam boyda ve ikon boyunda çizer; kenardan taşan, bir şeklin altında kalan, kontrastı düşük ya da fazla küçük yazıları listeler. Boyut sınırı postere göredir; uygulama ekranı için `--min-text 0.6` kullan.

Görsel kurallar `visuals.md` içindedir. Model onu sadece görsel işte okur, bu yüzden bir isim ya da slogan bu kuralları yüklemez.

## Lisans

MIT

## Yıldız geçmişi

<a href="https://star-history.com/#mankidev/antialgorithm&Date">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=mankidev/antialgorithm&type=Date&theme=dark">
    <img src="https://api.star-history.com/svg?repos=mankidev/antialgorithm&type=Date" alt="Star history chart for mankidev/antialgorithm">
  </picture>
</a>
