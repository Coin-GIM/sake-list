# 삭장고리스트 로컬 서버
$port = 8080
$root = $PSScriptRoot

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()

Write-Host ""
Write-Host "  🍶 삭장고리스트 서버 시작!" -ForegroundColor Green
Write-Host ""
Write-Host "  브라우저에서 아래 주소를 열어주세요:" -ForegroundColor Cyan
Write-Host "  http://localhost:$port/삭장고리스트.html" -ForegroundColor Yellow
Write-Host ""
Write-Host "  종료하려면 Ctrl+C 를 누르세요." -ForegroundColor Gray
Write-Host ""

$mimeTypes = @{
    '.html' = 'text/html; charset=utf-8'
    '.css'  = 'text/css'
    '.js'   = 'application/javascript'
    '.png'  = 'image/png'
    '.ico'  = 'image/x-icon'
}

while ($listener.IsListening) {
    try {
        $ctx  = $listener.GetContext()
        $req  = $ctx.Request
        $resp = $ctx.Response

        $urlPath = [Uri]::UnescapeDataString($req.Url.AbsolutePath)
        if ($urlPath -eq '/') { $urlPath = '/삭장고리스트.html' }

        $filePath = Join-Path $root $urlPath.TrimStart('/')

        if (Test-Path $filePath -PathType Leaf) {
            $ext  = [IO.Path]::GetExtension($filePath).ToLower()
            $mime = if ($mimeTypes[$ext]) { $mimeTypes[$ext] } else { 'application/octet-stream' }
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
    } catch [System.Net.HttpListenerException] {
        break
    } catch {
        # 개별 요청 오류는 무시하고 계속
    }
}

$listener.Stop()
Write-Host "서버가 종료되었습니다." -ForegroundColor Gray
