Add-Type -AssemblyName System.Drawing

$src = 'C:\projects\RewardPlannersWebApp\reward-planner-webapp\src\assets\games\gamesbanner.png'
$img = [System.Drawing.Bitmap]::FromFile($src)
Write-Host "gamesbanner.png width: $($img.Width), height: $($img.Height)"

# In gamesbanner.png (1942 x 809), the 3D controller, trophy, gift box, coins are on the right side:
# Roughly x=950 to 1900, y=50 to 780 (width ~950, height ~730)
$cropX = 960
$cropY = 60
$cropW = 950
$cropH = 720

$rect = New-Object System.Drawing.Rectangle($cropX, $cropY, $cropW, $cropH)
$bmp = New-Object System.Drawing.Bitmap($cropW, $cropH)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.DrawImage($img, (New-Object System.Drawing.Rectangle(0, 0, $cropW, $cropH)), $rect, [System.Drawing.GraphicsUnit]::Pixel)
$g.Dispose()

$dest = 'C:\projects\RewardPlannersWebApp\reward-planner-webapp\src\assets\games\hero_3d_art_hires.png'
$bmp.Save($dest, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
$img.Dispose()
Write-Host "Saved high-res 3D artwork to $dest ($cropW x $cropH)"
