# Regenereert assets/og-image.jpg uit assets/og-source.html.
# Render op 2x pixeldichtheid via headless Edge, daarna hoogwaardig terugschalen naar 1200x630.
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$assets = Join-Path $root "assets"
$src = Join-Path $assets "og-source.html"
$tmpPng = Join-Path $assets "og-image-2x.png"
$outJpg = Join-Path $assets "og-image.jpg"
$edge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
$profile = Join-Path $env:TEMP "edgeog-$([guid]::NewGuid())"

& $edge --headless --disable-gpu --no-first-run --hide-scrollbars `
  --force-device-scale-factor=2 --user-data-dir="$profile" --window-size=1200,630 `
  --screenshot="$tmpPng" "file:///$($src -replace '\\','/')" | Out-Null

Add-Type -AssemblyName System.Drawing
$imgSrc = [System.Drawing.Image]::FromFile($tmpPng)
$target = New-Object System.Drawing.Bitmap 1200, 630
$g = [System.Drawing.Graphics]::FromImage($target)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$g.DrawImage($imgSrc, 0, 0, 1200, 630)
$g.Dispose()
$encParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
$encParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [int64]92)
$jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
$target.Save($outJpg, $jpegCodec, $encParams)
$imgSrc.Dispose()
$target.Dispose()

Remove-Item $tmpPng -Force
Remove-Item $profile -Recurse -Force -ErrorAction SilentlyContinue
Write-Output "og-image.jpg geregenereerd: $outJpg"
