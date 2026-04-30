# 관리자 권한 확인
if (-not ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]"Administrator")) {
    Start-Process powershell -ArgumentList "-ExecutionPolicy Bypass -NoProfile -File `"$PSCommandPath`"" -Verb RunAs
    exit
}

$port = 8080
$root = Split-Path -Parent $PSCommandPath

# 방화벽 규칙 추가 (이미 있으면 무시)
netsh advfirewall firewall show rule name="삭장고리스트" > $null 2>&1
if ($LASTEXITCODE -ne 0) {
    netsh advfirewall firewall add rule name="삭장고리스트" dir=in action=allow protocol=TCP localport=$port | Out-Null
    Write-Host "  방화벽 포트 $port 개방 완료" -ForegroundColor Green
}

$ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {
    $_.IPAddress -notlike '127.*' -and $_.PrefixOrigin -ne 'WellKnown'
} | Select-Object -First 1).IPAddress

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://+:$port/")
$listener.Start()

Write-Host ""
Write-Host "  🍶 삭장고리스트 서버 시작!" -ForegroundColor Green
Write-Host ""
Write-Host "  [PC]     http://localhost:$port/삭장고리스트.html" -ForegroundColor Yellow
Write-Host "  [모바일] http://${ip}:$port/삭장고리스트.html" -ForegroundColor Cyan
Write-Host ""
Write-Host "  ※ 모바일 접속 전 Google Cloud Console에서" -ForegroundColor Gray
Write-Host "    http://${ip}:$port 를 승인된 출처에 추가하세요" -ForegroundColor Gray
Write-Host ""
Write-Host "  종료: Ctrl+C" -ForegroundColor Gray
Write-Host ""

$mimeTypes = @{ '.html'='text/html; charset=utf-8'; '.css'='text/css'; '.js'='application/javascript'; '.png'='image/png'; '.jpg'='image/jpeg'; '.ico'='image/x-icon' }

while ($listener.IsListening) {
    try {
        $ctx  = $listener.GetContext()
        $req  = $ctx.Request
        $resp = $ctx.Response
        $urlPath = [Uri]::UnescapeDataString($req.Url.AbsolutePath)
        if ($urlPath -eq '/') { $urlPath = '/삭장고리스트.html' }
        $filePath = Join-Path $root $urlPath.TrimStart('/')
        if (Test-Path $filePath -PathType Leaf) {
            $ext   = [IO.Path]::GetExtension($filePath).ToLower()
            $mime  = if ($mimeTypes[$ext]) { $mimeTypes[$ext] } else { 'application/octet-stream' }
            $bytes = [IO.File]::ReadAllBytes($filePath)
            $resp.ContentType     = $mime
            $resp.ContentLength64 = $bytes.Length
            $resp.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $resp.StatusCode = 404
            $msg = [Text.Encoding]::UTF8.GetBytes('404 Not Found')
            $resp.OutputStream.Write($msg, 0, $msg.Length)
        }
        $resp.OutputStream.Close()
    } catch [System.Net.HttpListenerException] { break }
    catch {}
}
$listener.Stop()
