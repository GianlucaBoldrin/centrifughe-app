Add-Type -AssemblyName System.Drawing

function New-Icon {
    param([int]$Size, [string]$Path, [double]$Pad = 0.0)

    $bmp = New-Object System.Drawing.Bitmap($Size, $Size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

    # background gradient (fresh green)
    $rect = New-Object System.Drawing.Rectangle(0, 0, $Size, $Size)
    $c1 = [System.Drawing.Color]::FromArgb(62, 175, 118)   # #3EAF76
    $c2 = [System.Drawing.Color]::FromArgb(31, 122, 96)    # #1F7A60
    $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, $c1, $c2, 55.0)

    # rounded background
    $radius = [int]($Size * 0.22)
    $gp = New-Object System.Drawing.Drawing2D.GraphicsPath
    $d = $radius * 2
    $gp.AddArc(0, 0, $d, $d, 180, 90)
    $gp.AddArc($Size - $d, 0, $d, $d, 270, 90)
    $gp.AddArc($Size - $d, $Size - $d, $d, $d, 0, 90)
    $gp.AddArc(0, $Size - $d, $d, $d, 90, 90)
    $gp.CloseFigure()
    $g.FillPath($brush, $gp)

    # droplet (white) centered
    $inset = $Size * (0.30 + $Pad)
    $cx = $Size / 2.0
    $topY = $Size * (0.24 + $Pad/2)
    $w = ($Size - 2*$inset)
    $bottomY = $Size * (0.80 - $Pad/2)
    $dropRadius = $w / 2.0
    $circleY = $bottomY - $dropRadius*2
    $white = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 255, 255))

    $drop = New-Object System.Drawing.Drawing2D.GraphicsPath
    # bottom circle
    $drop.AddEllipse($cx - $dropRadius, $bottomY - $dropRadius*2, $dropRadius*2, $dropRadius*2)
    # top triangle to a point
    $pts = New-Object 'System.Drawing.PointF[]' 3
    $pts[0] = New-Object System.Drawing.PointF([single]($cx), [single]$topY)
    $pts[1] = New-Object System.Drawing.PointF([single]($cx - $dropRadius*0.92), [single]($bottomY - $dropRadius))
    $pts[2] = New-Object System.Drawing.PointF([single]($cx + $dropRadius*0.92), [single]($bottomY - $dropRadius))
    $drop.AddPolygon($pts)
    $g.FillPath($white, $drop)

    # small green leaf accent inside droplet
    $leaf = New-Object System.Drawing.SolidBrush($c1)
    $lr = $dropRadius * 0.55
    $g.FillEllipse($leaf, [single]($cx - $lr*0.9), [single]($bottomY - $dropRadius - $lr*0.5), [single]($lr*1.1), [single]($lr*1.6))

    $g.Dispose()
    $bmp.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Host "wrote $Path"
}

$dir = Split-Path -Parent $MyInvocation.MyCommand.Path
New-Icon -Size 512 -Path (Join-Path $dir 'icon-512.png')
New-Icon -Size 192 -Path (Join-Path $dir 'icon-192.png')
New-Icon -Size 180 -Path (Join-Path $dir 'apple-touch-icon.png')
New-Icon -Size 512 -Path (Join-Path $dir 'icon-maskable-512.png') -Pad 0.06
