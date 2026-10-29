Add-Type -AssemblyName System.Drawing
$b = [System.Drawing.Bitmap]::FromFile('C:\projects\RewardPlannersWebApp\reward-planner-webapp\src\assets\games\hero_gaming_art.png')
Write-Host "Size: $($b.Width) x $($b.Height)"
$tl = $b.GetPixel(0, 0)
$tr = $b.GetPixel($b.Width - 1, 0)
$bl = $b.GetPixel(0, $b.Height - 1)
$br = $b.GetPixel($b.Width - 1, $b.Height - 1)
Write-Host "Top-Left: R=$($tl.R), G=$($tl.G), B=$($tl.B), A=$($tl.A)"
Write-Host "Top-Right: R=$($tr.R), G=$($tr.G), B=$($tr.B), A=$($tr.A)"
Write-Host "Bottom-Left: R=$($bl.R), G=$($bl.G), B=$($bl.B), A=$($bl.A)"
Write-Host "Bottom-Right: R=$($br.R), G=$($br.G), B=$($br.B), A=$($br.A)"
$b.Dispose()
