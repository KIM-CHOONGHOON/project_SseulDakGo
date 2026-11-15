async function verify() {
  try {
    const res = await fetch('http://localhost:3000/');
    console.log('HTTP Status:', res.status, res.headers.get('content-type'));
    const html = await res.text();
    console.log('HTML Length:', html.length);
    console.log('Has root div:', html.includes('id="root"'));
    console.log('Has WebClntAth010200:', html.includes('WebClntAth010200'));
    console.log('Has Naver Modal:', html.includes('naverAuthModalOpen'));
    console.log('Has Kakao Modal:', html.includes('kakaoAuthModalOpen'));
    console.log('Has Google Modal:', html.includes('googleAuthModalOpen'));
    console.log('Has setIsTelVerified(false):', html.includes('setIsTelVerified(false)'));

    // HTML 태그 카운트 (전체)
    const openDivs = (html.match(/<div(\s|>)/g) || []).length;
    const closeDivs = (html.match(/<\/div>/g) || []).length;
    console.log('Total Divs balance in HTML: open =', openDivs, ', close =', closeDivs, ', diff =', openDivs - closeDivs);

  } catch (err) {
    console.error('Verify failed:', err);
  }
}

verify();

