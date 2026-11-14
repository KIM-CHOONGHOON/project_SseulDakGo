[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$targetPathXlsx = "C:\GongGanDaWon_Project\project_SseulDakGo\쓸고닦고_WEB_화면작성현황.xlsx"
$targetPathXls = "C:\GongGanDaWon_Project\project_SseulDakGo\쓸고닦고_WEB_화면작성현황.xls"

$tempDir = Join-Path $env:TEMP ("xlsx_gen_" + [System.Guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null
New-Item -ItemType Directory -Path "$tempDir\_rels" -Force | Out-Null
New-Item -ItemType Directory -Path "$tempDir\xl\_rels" -Force | Out-Null
New-Item -ItemType Directory -Path "$tempDir\xl\worksheets" -Force | Out-Null

$utf8NoBom = [System.Text.UTF8Encoding]::new($false)
function Write-FileUtf8([string]$p, [string]$c) {
    [System.IO.File]::WriteAllText($p, $c, [System.Text.UTF8Encoding]::new($false))
}

function Escape-Xml([string]$str) {
    if ([string]::IsNullOrEmpty($str)) { return "" }
    return $str.Replace("&", "&amp;").Replace("<", "&lt;").Replace(">", "&gt;").Replace('"', "&quot;")
}

# SharedStrings 관리
$script:sstList = [System.Collections.Generic.List[string]]::new()
$script:sstMap = @{}

function Get-SstIndex([string]$val) {
    if ($null -eq $val) { $val = "" }
    if ($script:sstMap.ContainsKey($val)) {
        return $script:sstMap[$val]
    }
    $idx = $script:sstList.Count
    $script:sstList.Add($val)
    $script:sstMap[$val] = $idx
    return $idx
}

# 1. [Content_Types].xml
$contentTypes = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/worksheets/sheet3.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/worksheets/sheet4.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>
"@
Write-FileUtf8 "$tempDir\[Content_Types].xml" $contentTypes

# 2. _rels/.rels
$rootRels = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>
"@
Write-FileUtf8 "$tempDir\_rels\.rels" $rootRels

# 3. xl/workbook.xml
$workbook = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <bookViews>
    <workbookView xWindow="0" yWindow="0" windowWidth="24000" windowHeight="12000"/>
  </bookViews>
  <sheets>
    <sheet name="전체현황요약" sheetId="1" r:id="rId1"/>
    <sheet name="고객영역(Client)" sheetId="2" r:id="rId2"/>
    <sheet name="용역영역(Service)" sheetId="3" r:id="rId3"/>
    <sheet name="관리자영역(Admin)" sheetId="4" r:id="rId4"/>
  </sheets>
</workbook>
"@
Write-FileUtf8 "$tempDir\xl\workbook.xml" $workbook

# 4. xl/_rels/workbook.xml.rels (Target은 xl/ 기준 상대경로!)
$wbRels = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet3.xml"/>
  <Relationship Id="rId4" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet4.xml"/>
  <Relationship Id="rId5" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
  <Relationship Id="rId6" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/>
</Relationships>
"@
Write-FileUtf8 "$tempDir\xl\_rels\workbook.xml.rels" $wbRels

# 5. xl/styles.xml (완전한 MS Excel 호환 표준)
$styles = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="4">
    <font><name val="맑은 고딕"/><sz val="10"/><color rgb="FF0F172A"/></font>
    <font><b/><name val="맑은 고딕"/><sz val="14"/><color rgb="FF1F497D"/></font>
    <font><b/><name val="맑은 고딕"/><sz val="10"/><color rgb="FFFFFFFF"/></font>
    <font><b/><name val="맑은 고딕"/><sz val="10"/><color rgb="FF0F172A"/></font>
  </fonts>
  <fills count="5">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF1F497D"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFF1F5F9"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFE2E8F0"/></patternFill></fill>
  </fills>
  <borders count="2">
    <border><left/><right/><top/><bottom/><diagonal/></border>
    <border>
      <left style="thin"><color rgb="FFCBD5E1"/></left>
      <right style="thin"><color rgb="FFCBD5E1"/></right>
      <top style="thin"><color rgb="FFCBD5E1"/></top>
      <bottom style="thin"><color rgb="FFCBD5E1"/></bottom>
      <diagonal/>
    </border>
  </borders>
  <cellStyleXfs count="1">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0"/>
  </cellStyleXfs>
  <cellXfs count="7">
    <!-- 0: 일반 기본 -->
    <xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0"/>
    <!-- 1: 제목 타이틀 (Bold 14 Navy) -->
    <xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/>
    <!-- 2: 헤더 (Navy 배경 + White 텍스트 + 중앙 정렬) -->
    <xf numFmtId="0" fontId="2" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1">
      <alignment horizontal="center" vertical="center"/>
    </xf>
    <!-- 3: 본문 중앙 정렬 -->
    <xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyFont="1" applyBorder="1" applyAlignment="1">
      <alignment horizontal="center" vertical="center"/>
    </xf>
    <!-- 4: 본문 좌측 정렬 -->
    <xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyFont="1" applyBorder="1" applyAlignment="1">
      <alignment horizontal="left" vertical="center"/>
    </xf>
    <!-- 5: 합계 행 (Bold + 연회색 배경 + 중앙 정렬) -->
    <xf numFmtId="0" fontId="3" fillId="4" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1">
      <alignment horizontal="center" vertical="center"/>
    </xf>
    <!-- 6: 본문 우측 정렬 -->
    <xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyFont="1" applyBorder="1" applyAlignment="1">
      <alignment horizontal="right" vertical="center"/>
    </xf>
  </cellXfs>
  <cellStyles count="1">
    <cellStyle name="Normal" xfId="0" builtinId="0"/>
  </cellStyles>
</styleSheet>
"@
Write-FileUtf8 "$tempDir\xl\styles.xml" $styles

# -------------------------------------------------------------
# Sheet 1: 전체현황요약
# -------------------------------------------------------------
$t1 = Get-SstIndex "■ [쓸고닦고 (SseulDakGo)] WEB 프론트엔드 전체 화면 작성 현황 요약"
$t2 = Get-SstIndex "기준일시: 2026-11-13 | 전체 대상 화면: 총 28개"
$th1 = Get-SstIndex "도메인 구분"
$th2 = Get-SstIndex "전체 대상 화면 수"
$th3 = Get-SstIndex "화면작성완료"
$th4 = Get-SstIndex "미완료"
$th5 = Get-SstIndex "진척도"

$d1 = Get-SstIndex "1. 고객 영역 (Client)"
$p1 = Get-SstIndex "90.0%"
$d2 = Get-SstIndex "2. 용역 영역 (Service)"
$p2 = Get-SstIndex "0.0%"
$d3 = Get-SstIndex "3. 관리자 영역 (Admin)"
$p3 = Get-SstIndex "0.0%"
$tot = Get-SstIndex "합계"
$ptot = Get-SstIndex "32.1%"

$s1Data = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <cols>
    <col min="1" max="1" width="28" customWidth="1"/>
    <col min="2" max="2" width="20" customWidth="1"/>
    <col min="3" max="3" width="18" customWidth="1"/>
    <col min="4" max="4" width="18" customWidth="1"/>
    <col min="5" max="5" width="18" customWidth="1"/>
  </cols>
  <sheetData>
    <row r="1" ht="30" customHeight="1">
      <c r="A1" s="1" t="s"><v>$t1</v></c>
    </row>
    <row r="2" ht="20" customHeight="1">
      <c r="A2" s="0" t="s"><v>$t2</v></c>
    </row>
    <row r="3" ht="10" customHeight="1"/>
    <row r="4" ht="25" customHeight="1">
      <c r="A4" s="2" t="s"><v>$th1</v></c>
      <c r="B4" s="2" t="s"><v>$th2</v></c>
      <c r="C4" s="2" t="s"><v>$th3</v></c>
      <c r="D4" s="2" t="s"><v>$th4</v></c>
      <c r="E4" s="2" t="s"><v>$th5</v></c>
    </row>
    <row r="5" ht="22" customHeight="1">
      <c r="A5" s="3" t="s"><v>$d1</v></c>
      <c r="B5" s="3"><v>10</v></c>
      <c r="C5" s="3"><v>9</v></c>
      <c r="D5" s="3"><v>1</v></c>
      <c r="E5" s="3" t="s"><v>$p1</v></c>
    </row>
    <row r="6" ht="22" customHeight="1">
      <c r="A6" s="3" t="s"><v>$d2</v></c>
      <c r="B6" s="3"><v>10</v></c>
      <c r="C6" s="3"><v>0</v></c>
      <c r="D6" s="3"><v>10</v></c>
      <c r="E6" s="3" t="s"><v>$p2</v></c>
    </row>
    <row r="7" ht="22" customHeight="1">
      <c r="A7" s="3" t="s"><v>$d3</v></c>
      <c r="B7" s="3"><v>8</v></c>
      <c r="C7" s="3"><v>0</v></c>
      <c r="D7" s="3"><v>8</v></c>
      <c r="E7" s="3" t="s"><v>$p3</v></c>
    </row>
    <row r="8" ht="24" customHeight="1">
      <c r="A8" s="5" t="s"><v>$tot</v></c>
      <c r="B8" s="5"><v>28</v></c>
      <c r="C8" s="5"><v>9</v></c>
      <c r="D8" s="5"><v>19</v></c>
      <c r="E8" s="5" t="s"><v>$ptot</v></c>
    </row>
  </sheetData>
</worksheet>
"@
Write-FileUtf8 "$tempDir\xl\worksheets\sheet1.xml" $s1Data

# -------------------------------------------------------------
# 공통 리스트 시트 빌더
# -------------------------------------------------------------
function Build-ListWorksheet([string]$titleText, [array]$items) {
    $sb = [System.Text.StringBuilder]::new()
    [void]$sb.AppendLine('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>')
    [void]$sb.AppendLine('<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">')
    [void]$sb.AppendLine('  <cols>')
    [void]$sb.AppendLine('    <col min="1" max="1" width="8" customWidth="1"/>')
    [void]$sb.AppendLine('    <col min="2" max="2" width="22" customWidth="1"/>')
    [void]$sb.AppendLine('    <col min="3" max="3" width="16" customWidth="1"/>')
    [void]$sb.AppendLine('    <col min="4" max="4" width="45" customWidth="1"/>')
    [void]$sb.AppendLine('    <col min="5" max="5" width="68" customWidth="1"/>')
    [void]$sb.AppendLine('    <col min="6" max="6" width="18" customWidth="1"/>')
    [void]$sb.AppendLine('  </cols>')
    [void]$sb.AppendLine('  <sheetData>')

    $titleIdx = Get-SstIndex "■ $titleText"
    [void]$sb.AppendLine('    <row r="1" ht="30" customHeight="1">')
    [void]$sb.AppendLine("      <c r=""A1"" s=""1"" t=""s""><v>$titleIdx</v></c>")
    [void]$sb.AppendLine('    </row>')

    $hNo = Get-SstIndex "No"
    $hId = Get-SstIndex "화면 ID"
    $hType = Get-SstIndex "화면 구분"
    $hName = Get-SstIndex "화면명"
    $hPath = Get-SstIndex "프론트엔드 파일 경로"
    $hStat = Get-SstIndex "작성 상태"

    [void]$sb.AppendLine('    <row r="2" ht="25" customHeight="1">')
    [void]$sb.AppendLine("      <c r=""A2"" s=""2"" t=""s""><v>$hNo</v></c>")
    [void]$sb.AppendLine("      <c r=""B2"" s=""2"" t=""s""><v>$hId</v></c>")
    [void]$sb.AppendLine("      <c r=""C2"" s=""2"" t=""s""><v>$hType</v></c>")
    [void]$sb.AppendLine("      <c r=""D2"" s=""2"" t=""s""><v>$hName</v></c>")
    [void]$sb.AppendLine("      <c r=""E2"" s=""2"" t=""s""><v>$hPath</v></c>")
    [void]$sb.AppendLine("      <c r=""F2"" s=""2"" t=""s""><v>$hStat</v></c>")
    [void]$sb.AppendLine('    </row>')

    $rowNum = 3
    foreach ($it in $items) {
        $noVal = $it.No
        $idIdx = Get-SstIndex $it.Id
        $typeIdx = Get-SstIndex $it.Type
        $nameIdx = Get-SstIndex $it.Name
        $pathIdx = Get-SstIndex $it.Path
        $statIdx = Get-SstIndex $it.Status

        [void]$sb.AppendLine("    <row r=""$rowNum"" ht=""22"" customHeight=""1"">")
        [void]$sb.AppendLine("      <c r=""A$rowNum"" s=""3""><v>$noVal</v></c>")
        [void]$sb.AppendLine("      <c r=""B$rowNum"" s=""3"" t=""s""><v>$idIdx</v></c>")
        [void]$sb.AppendLine("      <c r=""C$rowNum"" s=""3"" t=""s""><v>$typeIdx</v></c>")
        [void]$sb.AppendLine("      <c r=""D$rowNum"" s=""4"" t=""s""><v>$nameIdx</v></c>")
        [void]$sb.AppendLine("      <c r=""E$rowNum"" s=""4"" t=""s""><v>$pathIdx</v></c>")
        [void]$sb.AppendLine("      <c r=""F$rowNum"" s=""3"" t=""s""><v>$statIdx</v></c>")
        [void]$sb.AppendLine('    </row>')
        $rowNum++
    }

    [void]$sb.AppendLine('  </sheetData>')
    [void]$sb.AppendLine('</worksheet>')
    return $sb.ToString()
}

# -------------------------------------------------------------
# Sheet 2: 고객영역(Client)
# -------------------------------------------------------------
$clientRows = @(
  @{No=1; Id="WEB-CLNT-COM-010000"; Type="Main"; Name="고객 메인 홈"; Path="SseulDakGo_Web/Client/frontend/WEB-CLNT-COM-010000/index.jsx"; Status="화면작성완료"},
  @{No=2; Id="WEB-CLNT-REQ-010100"; Type="Sub (모달)"; Name="청소 서비스 신청 (발주서 작성)"; Path="SseulDakGo_Web/Client/frontend/WEB-CLNT-REQ-010100/index.jsx"; Status="화면작성완료"},
  @{No=3; Id="WEB-CLNT-REQ-010101"; Type="Sub (모달)"; Name="동일 시공 현장 주소 확인 및 변경 안내"; Path="SseulDakGo_Web/Client/frontend/WEB-CLNT-REQ-010101/index.jsx"; Status="화면작성완료"},
  @{No=4; Id="WEB-CLNT-ATH-010100"; Type="Sub (모달)"; Name="고객 로그인 (네이버/카카오 간편인증)"; Path="SseulDakGo_Web/Client/frontend/WEB-CLNT-ATH-010100/index.jsx"; Status="화면작성완료"},
  @{No=5; Id="WEB-CLNT-ATH-010200"; Type="Sub (모달)"; Name="통합 회원가입 및 약관동의 서명 (네이버/카카오 연동)"; Path="SseulDakGo_Web/Client/frontend/WEB-CLNT-ATH-010200/index.jsx"; Status="화면작성완료"},
  @{No=6; Id="WEB-CLNT-ATH-010201"; Type="Sub (모달)"; Name="고객 가입 완료 환영 안내"; Path="SseulDakGo_Web/Client/frontend/WEB-CLNT-ATH-010201/index.jsx"; Status="화면작성완료"},
  @{No=7; Id="WEB-CLNT-ORD-010000"; Type="Main"; Name="나의 청소 신청 현황"; Path="SseulDakGo_Web/Client/frontend/WEB-CLNT-ORD-010000/index.jsx"; Status="화면작성완료"},
  @{No=8; Id="WEB-CLNT-ORD-010100"; Type="Sub"; Name="청소 요청 상세 및 용역 청약서 비교/선택"; Path="SseulDakGo_Web/Client/frontend/WEB-CLNT-ORD-010100/index.jsx"; Status="화면작성완료"},
  @{No=9; Id="WEB-CLNT-PAY-010100"; Type="Sub (모달)"; Name="고객 데이터 이용료 결제 및 배타적 계약 확정"; Path="SseulDakGo_Web/Client/frontend/WEB-CLNT-PAY-010100/index.jsx"; Status="화면작성완료"},
  @{No=10; Id="WEB-CLNT-JOB-010100"; Type="Sub"; Name="청소 시공 검수 및 현장 직불 완료 승인"; Path="SseulDakGo_Web/Client/frontend/WEB-CLNT-JOB-010100/index.jsx"; Status="화면작성완료"}
)
$s2Data = Build-ListWorksheet "[고객 영역 : Client] 웹 화면 개발 목록 (10개)" $clientRows
Write-FileUtf8 "$tempDir\xl\worksheets\sheet2.xml" $s2Data

# -------------------------------------------------------------
# Sheet 3: 용역영역(Service)
# -------------------------------------------------------------
$serviceRows = @(
  @{No=1; Id="WEB-SRVC-MAIN-010000"; Type="Main"; Name="용역 서비스 메인 홈"; Path="SseulDakGo_Web/Service/frontend/WEB-SRVC-MAIN-010000/index.jsx"; Status="미완료"},
  @{No=2; Id="WEB-SRVC-ATH-010100"; Type="Sub (모달)"; Name="용역 서비스 로그인"; Path="SseulDakGo_Web/Service/frontend/WEB-SRVC-ATH-010100/index.jsx"; Status="미완료"},
  @{No=3; Id="WEB-SRVC-ATH-020000"; Type="Main"; Name="사업자등록증 원본 업로드 및 OCR AI 진위 검증"; Path="SseulDakGo_Web/Service/frontend/WEB-SRVC-ATH-020000/index.jsx"; Status="미완료"},
  @{No=4; Id="WEB-SRVC-ATH-030000"; Type="Main"; Name="용역 위탁계약서 및 전자서명"; Path="SseulDakGo_Web/Service/frontend/WEB-SRVC-ATH-030000/index.jsx"; Status="미완료"},
  @{No=5; Id="WEB-SRVC-ORD-010000"; Type="Main"; Name="실시간 청소 발주 공고 목록"; Path="SseulDakGo_Web/Service/frontend/WEB-SRVC-ORD-010000/index.jsx"; Status="미완료"},
  @{No=6; Id="WEB-SRVC-ORD-010100"; Type="Sub (모달)"; Name="청소 발주 상세 정보 (고객 확정가 확인)"; Path="SseulDakGo_Web/Service/frontend/WEB-SRVC-ORD-010100/index.jsx"; Status="미완료"},
  @{No=7; Id="WEB-SRVC-QOT-010100"; Type="Sub (모달)"; Name="청약서 작성 및 방문 일정 제안"; Path="SseulDakGo_Web/Service/frontend/WEB-SRVC-QOT-010100/index.jsx"; Status="미완료"},
  @{No=8; Id="WEB-SRVC-JOB-010000"; Type="Main"; Name="시공 작업 관리 및 캘린더"; Path="SseulDakGo_Web/Service/frontend/WEB-SRVC-JOB-010000/index.jsx"; Status="미완료"},
  @{No=9; Id="WEB-SRVC-JOB-010100"; Type="Sub"; Name="시공 전/후 사진 등록 및 검수 요청"; Path="SseulDakGo_Web/Service/frontend/WEB-SRVC-JOB-010100/index.jsx"; Status="미완료"},
  @{No=10; Id="WEB-SRVC-SET-010000"; Type="Main"; Name="용역 정산 및 활동 지역 설정"; Path="SseulDakGo_Web/Service/frontend/WEB-SRVC-SET-010000/index.jsx"; Status="미완료"}
)
$s3Data = Build-ListWorksheet "[용역 영역 : Service] 웹 화면 개발 목록 (10개)" $serviceRows
Write-FileUtf8 "$tempDir\xl\worksheets\sheet3.xml" $s3Data

# -------------------------------------------------------------
# Sheet 4: 관리자영역(Admin)
# -------------------------------------------------------------
$adminRows = @(
  @{No=1; Id="WEB-ADMN-DSH-010000"; Type="Main"; Name="전국 종합 관제 대시보드"; Path="SseulDakGo_Web/Admin/frontend/WEB-ADMN-DSH-010000/index.jsx"; Status="미완료"},
  @{No=2; Id="WEB-ADMN-ATH-010000"; Type="Main"; Name="관리자 보안 로그인 (OTP 2차 인증)"; Path="SseulDakGo_Web/Admin/frontend/WEB-ADMN-ATH-010000/index.jsx"; Status="미완료"},
  @{No=3; Id="WEB-ADMN-ORD-010000"; Type="Main"; Name="청소 발주 및 계약 체결 관제"; Path="SseulDakGo_Web/Admin/frontend/WEB-ADMN-ORD-010000/index.jsx"; Status="미완료"},
  @{No=4; Id="WEB-ADMN-ALC-010000"; Type="Main"; Name="외부 플랫폼 제휴 및 정보이용료 정산 관제"; Path="SseulDakGo_Web/Admin/frontend/WEB-ADMN-ALC-010000/index.jsx"; Status="미완료"},
  @{No=5; Id="WEB-ADMN-ALC-010100"; Type="Sub (모달)"; Name="제휴 거래 상세 내역 및 정산 산출 근거"; Path="SseulDakGo_Web/Admin/frontend/WEB-ADMN-ALC-010100/index.jsx"; Status="미완료"},
  @{No=6; Id="WEB-ADMN-PTN-010000"; Type="Main"; Name="용역 서비스 입점 심사 및 서류 검증"; Path="SseulDakGo_Web/Admin/frontend/WEB-ADMN-PTN-010000/index.jsx"; Status="미완료"},
  @{No=7; Id="WEB-ADMN-DSP-010000"; Type="Main"; Name="거래 취소 및 분쟁 중재 콘솔"; Path="SseulDakGo_Web/Admin/frontend/WEB-ADMN-DSP-010000/index.jsx"; Status="미완료"},
  @{No=8; Id="WEB-ADMN-SYS-010000"; Type="Main"; Name="시스템 공통 코드 및 정책 설정"; Path="SseulDakGo_Web/Admin/frontend/WEB-ADMN-SYS-010000/index.jsx"; Status="미완료"}
)
$s4Data = Build-ListWorksheet "[관리 영역 : Admin] 웹 화면 개발 목록 (8개)" $adminRows
Write-FileUtf8 "$tempDir\xl\worksheets\sheet4.xml" $s4Data

# -------------------------------------------------------------
# xl/sharedStrings.xml 작성
# -------------------------------------------------------------
$sstCount = $script:sstList.Count
$sstSb = [System.Text.StringBuilder]::new()
[void]$sstSb.AppendLine('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>')
[void]$sstSb.AppendLine("<sst xmlns=`"http://schemas.openxmlformats.org/spreadsheetml/2006/main`" count=`"$sstCount`" uniqueCount=`"$sstCount`">")
foreach ($s in $script:sstList) {
    $esc = Escape-Xml $s
    [void]$sstSb.AppendLine("  <si><t>$esc</t></si>")
}
[void]$sstSb.AppendLine('</sst>')
Write-FileUtf8 "$tempDir\xl\sharedStrings.xml" $sstSb.ToString()

# -------------------------------------------------------------
# Zip into .xlsx
# -------------------------------------------------------------
Add-Type -AssemblyName System.IO.Compression.FileSystem
$xlsxSuccess = $false
try {
    if (Test-Path $targetPathXlsx) {
        Remove-Item $targetPathXlsx -Force -ErrorAction Stop
    }
    [System.IO.Compression.ZipFile]::CreateFromDirectory($tempDir, $targetPathXlsx)
    $xlsxSuccess = $true
    Write-Output "SUCCESS_XLSX: $targetPathXlsx"
} catch {
    Write-Warning "기존 파일이 열려 있어 대체 파일명(쓸고닦고_WEB_화면작성현황(신규채번).xlsx)으로 생성합니다."
    $altXlsx = "$PSScriptRoot\..\쓸고닦고_WEB_화면작성현황(신규채번).xlsx"
    if (Test-Path $altXlsx) { Remove-Item $altXlsx -Force -ErrorAction SilentlyContinue }
    [System.IO.Compression.ZipFile]::CreateFromDirectory($tempDir, $altXlsx)
    Write-Output "SUCCESS_XLSX: $altXlsx"
}
Remove-Item -Recurse -Force $tempDir

# -------------------------------------------------------------
# 호환성을 위한 SpreadsheetML (.xls) 동시 생성
# -------------------------------------------------------------
function Build-SpreadsheetML() {
    $sb = [System.Text.StringBuilder]::new()
    [void]$sb.AppendLine('<?xml version="1.0" encoding="UTF-8"?>')
    [void]$sb.AppendLine('<?mso-application progid="Excel.Sheet"?>')
    [void]$sb.AppendLine('<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"')
    [void]$sb.AppendLine(' xmlns:o="urn:schemas-microsoft-com:office:office"')
    [void]$sb.AppendLine(' xmlns:x="urn:schemas-microsoft-com:office:excel"')
    [void]$sb.AppendLine(' xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"')
    [void]$sb.AppendLine(' xmlns:html="http://www.w3.org/TR/REC-html40">')
    [void]$sb.AppendLine(' <Styles>')
    [void]$sb.AppendLine('  <Style ss:ID="Default" ss:Name="Normal"><Font ss:FontName="맑은 고딕" ss:Size="10"/></Style>')
    [void]$sb.AppendLine('  <Style ss:ID="sTitle"><Font ss:FontName="맑은 고딕" ss:Size="14" ss:Bold="1" ss:Color="#1F497D"/></Style>')
    [void]$sb.AppendLine('  <Style ss:ID="sHeader"><Font ss:FontName="맑은 고딕" ss:Size="10" ss:Bold="1" ss:Color="#FFFFFF"/><Interior ss:Color="#1F497D" ss:Pattern="Solid"/><Alignment ss:Horizontal="Center" ss:Vertical="Center"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/><Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/><Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/></Borders></Style>')
    [void]$sb.AppendLine('  <Style ss:ID="sCenter"><Alignment ss:Horizontal="Center" ss:Vertical="Center"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/><Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/><Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/></Borders></Style>')
    [void]$sb.AppendLine('  <Style ss:ID="sLeft"><Alignment ss:Horizontal="Left" ss:Vertical="Center"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/><Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/><Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/></Borders></Style>')
    [void]$sb.AppendLine('  <Style ss:ID="sTotal"><Font ss:FontName="맑은 고딕" ss:Size="10" ss:Bold="1"/><Interior ss:Color="#E2E8F0" ss:Pattern="Solid"/><Alignment ss:Horizontal="Center" ss:Vertical="Center"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/><Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/><Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/></Borders></Style>')
    [void]$sb.AppendLine(' </Styles>')

    # 1. 전체현황요약
    [void]$sb.AppendLine(' <Worksheet ss:Name="전체현황요약">')
    [void]$sb.AppendLine('  <Table ss:DefaultRowHeight="20">')
    [void]$sb.AppendLine('   <Column ss:Width="160"/>')
    [void]$sb.AppendLine('   <Column ss:Width="120"/>')
    [void]$sb.AppendLine('   <Column ss:Width="100"/>')
    [void]$sb.AppendLine('   <Column ss:Width="100"/>')
    [void]$sb.AppendLine('   <Column ss:Width="100"/>')
    [void]$sb.AppendLine('   <Row ss:Height="30"><Cell ss:StyleID="sTitle"><Data ss:Type="String">■ [쓸고닦고] WEB 프론트엔드 전체 화면 작성 현황 요약</Data></Cell></Row>')
    [void]$sb.AppendLine('   <Row><Cell><Data ss:Type="String">기준일시: 2026-11-13 | 전체 대상 화면: 총 28개</Data></Cell></Row>')
    [void]$sb.AppendLine('   <Row ss:Height="10"/>')
    [void]$sb.AppendLine('   <Row ss:Height="25">')
    [void]$sb.AppendLine('    <Cell ss:StyleID="sHeader"><Data ss:Type="String">도메인 구분</Data></Cell>')
    [void]$sb.AppendLine('    <Cell ss:StyleID="sHeader"><Data ss:Type="String">전체 대상 화면 수</Data></Cell>')
    [void]$sb.AppendLine('    <Cell ss:StyleID="sHeader"><Data ss:Type="String">화면작성완료</Data></Cell>')
    [void]$sb.AppendLine('    <Cell ss:StyleID="sHeader"><Data ss:Type="String">미완료</Data></Cell>')
    [void]$sb.AppendLine('    <Cell ss:StyleID="sHeader"><Data ss:Type="String">진척도</Data></Cell>')
    [void]$sb.AppendLine('   </Row>')
    [void]$sb.AppendLine('   <Row><Cell ss:StyleID="sCenter"><Data ss:Type="String">1. 고객 영역 (Client)</Data></Cell><Cell ss:StyleID="sCenter"><Data ss:Type="Number">10</Data></Cell><Cell ss:StyleID="sCenter"><Data ss:Type="Number">9</Data></Cell><Cell ss:StyleID="sCenter"><Data ss:Type="Number">1</Data></Cell><Cell ss:StyleID="sCenter"><Data ss:Type="String">90.0%</Data></Cell></Row>')
    [void]$sb.AppendLine('   <Row><Cell ss:StyleID="sCenter"><Data ss:Type="String">2. 용역 영역 (Service)</Data></Cell><Cell ss:StyleID="sCenter"><Data ss:Type="Number">10</Data></Cell><Cell ss:StyleID="sCenter"><Data ss:Type="Number">0</Data></Cell><Cell ss:StyleID="sCenter"><Data ss:Type="Number">10</Data></Cell><Cell ss:StyleID="sCenter"><Data ss:Type="String">0.0%</Data></Cell></Row>')
    [void]$sb.AppendLine('   <Row><Cell ss:StyleID="sCenter"><Data ss:Type="String">3. 관리자 영역 (Admin)</Data></Cell><Cell ss:StyleID="sCenter"><Data ss:Type="Number">8</Data></Cell><Cell ss:StyleID="sCenter"><Data ss:Type="Number">0</Data></Cell><Cell ss:StyleID="sCenter"><Data ss:Type="Number">8</Data></Cell><Cell ss:StyleID="sCenter"><Data ss:Type="String">0.0%</Data></Cell></Row>')
    [void]$sb.AppendLine('   <Row ss:Height="24"><Cell ss:StyleID="sTotal"><Data ss:Type="String">합계</Data></Cell><Cell ss:StyleID="sTotal"><Data ss:Type="Number">28</Data></Cell><Cell ss:StyleID="sTotal"><Data ss:Type="Number">9</Data></Cell><Cell ss:StyleID="sTotal"><Data ss:Type="Number">19</Data></Cell><Cell ss:StyleID="sTotal"><Data ss:Type="String">32.1%</Data></Cell></Row>')
    [void]$sb.AppendLine('  </Table>')
    [void]$sb.AppendLine(' </Worksheet>')

    function Add-ListWs([string]$wsName, [array]$rows) {
        [void]$sb.AppendLine(" <Worksheet ss:Name=`"$wsName`">")
        [void]$sb.AppendLine('  <Table ss:DefaultRowHeight="20">')
        [void]$sb.AppendLine('   <Column ss:Width="50"/>')
        [void]$sb.AppendLine('   <Column ss:Width="140"/>')
        [void]$sb.AppendLine('   <Column ss:Width="100"/>')
        [void]$sb.AppendLine('   <Column ss:Width="260"/>')
        [void]$sb.AppendLine('   <Column ss:Width="380"/>')
        [void]$sb.AppendLine('   <Column ss:Width="100"/>')
        [void]$sb.AppendLine("   <Row ss:Height=`"30`"><Cell ss:StyleID=`"sTitle`"><Data ss:Type=`"String`">■ $wsName 목록</Data></Cell></Row>")
        [void]$sb.AppendLine('   <Row ss:Height="25">')
        [void]$sb.AppendLine('    <Cell ss:StyleID="sHeader"><Data ss:Type="String">No</Data></Cell>')
        [void]$sb.AppendLine('    <Cell ss:StyleID="sHeader"><Data ss:Type="String">화면 ID</Data></Cell>')
        [void]$sb.AppendLine('    <Cell ss:StyleID="sHeader"><Data ss:Type="String">화면 구분</Data></Cell>')
        [void]$sb.AppendLine('    <Cell ss:StyleID="sHeader"><Data ss:Type="String">화면명</Data></Cell>')
        [void]$sb.AppendLine('    <Cell ss:StyleID="sHeader"><Data ss:Type="String">프론트엔드 파일 경로</Data></Cell>')
        [void]$sb.AppendLine('    <Cell ss:StyleID="sHeader"><Data ss:Type="String">작성 상태</Data></Cell>')
        [void]$sb.AppendLine('   </Row>')

        foreach ($r in $rows) {
            $no = $r.No
            $id = Escape-Xml $r.Id
            $t = Escape-Xml $r.Type
            $n = Escape-Xml $r.Name
            $p = Escape-Xml $r.Path
            $s = Escape-Xml $r.Status

            [void]$sb.AppendLine("   <Row>")
            [void]$sb.AppendLine("    <Cell ss:StyleID=`"sCenter`"><Data ss:Type=`"Number`">$no</Data></Cell>")
            [void]$sb.AppendLine("    <Cell ss:StyleID=`"sCenter`"><Data ss:Type=`"String`">$id</Data></Cell>")
            [void]$sb.AppendLine("    <Cell ss:StyleID=`"sCenter`"><Data ss:Type=`"String`">$t</Data></Cell>")
            [void]$sb.AppendLine("    <Cell ss:StyleID=`"sLeft`"><Data ss:Type=`"String`">$n</Data></Cell>")
            [void]$sb.AppendLine("    <Cell ss:StyleID=`"sLeft`"><Data ss:Type=`"String`">$p</Data></Cell>")
            [void]$sb.AppendLine("    <Cell ss:StyleID=`"sCenter`"><Data ss:Type=`"String`">$s</Data></Cell>")
            [void]$sb.AppendLine("   </Row>")
        }
        [void]$sb.AppendLine('  </Table>')
        [void]$sb.AppendLine(' </Worksheet>')
    }

    Add-ListWs "고객영역(Client)" $clientRows
    Add-ListWs "용역영역(Service)" $serviceRows
    Add-ListWs "관리자영역(Admin)" $adminRows

    [void]$sb.AppendLine('</Workbook>')
    return $sb.ToString()
}

$xmlContent = Build-SpreadsheetML
Write-FileUtf8 $targetPathXls $xmlContent
Write-Output "SUCCESS_XLS: $targetPathXls"
