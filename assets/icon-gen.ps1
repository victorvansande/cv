# Regenereert de PNG-iconen in assets/icons uit de twee SVG-bronnen ernaast.
# favicon.svg (afgeronde tegel) wordt de 32px-favicon voor browsers zonder
# SVG-ondersteuning; icon-full.svg (vierkant, inhoud iets kleiner zodat Android
# er een cirkel uit kan knippen) wordt het app-icoon voor iPhone en Android.
# Werkwijze zoals og-gen.ps1: headless Edge rendert op 512px, daarna
# hoogwaardig terugschalen.
$ErrorActionPreference = "Stop"
$icons = Join-Path (Split-Path -Parent $PSScriptRoot) "assets\icons"
$edge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
Add-Type -AssemblyName System.Drawing

function Render($svg, $png) {
  $html = Join-Path $icons "render-tmp.html"
  "<html><body style='margin:0;background:transparent'><img src='$svg' width='512' height='512' style='display:block'></body></html>" |
    Set-Content -Encoding utf8 $html
  $profile = Join-Path $env:TEMP "edgeicon-$([guid]::NewGuid())"
  & $edge --headless --disable-gpu --no-first-run --hide-scrollbars --default-background-color=00000000 `
    --user-data-dir="$profile" --window-size=512,512 --screenshot="$png" "file:///$($html.Replace('\','/'))" | Out-Null
  Remove-Item $html
}

function Schaal($src, $dst, $size) {
  $img = [System.Drawing.Image]::FromFile($src)
  $bmp = New-Object System.Drawing.Bitmap $size, $size
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.DrawImage($img, 0, 0, $size, $size)
  $g.Dispose(); $img.Dispose()
  $bmp.Save($dst, [System.Drawing.Imaging.ImageFormat]::Png); $bmp.Dispose()
}

$tegel = Join-Path $icons "tegel-512-tmp.png"
$vol = Join-Path $icons "icon-512.png"
Render "favicon.svg" $tegel
Render "icon-full.svg" $vol
Schaal $tegel (Join-Path $icons "favicon-32.png") 32
Schaal $vol (Join-Path $icons "apple-touch-icon.png") 180
Schaal $vol (Join-Path $icons "icon-192.png") 192
Remove-Item $tegel
Write-Host "Iconen bijgewerkt in $icons"
