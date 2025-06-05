document.getElementById('convertForm').addEventListener('submit', async (event) => {
  event.preventDefault();

  const fileInput = document.getElementById('videoInput');
  const file = fileInput.files[0];
  const button = document.getElementById('convertBtn');

  if (!file) {
    alert('Please select a video file first.');
    return;
  }

  const formData = new FormData();
  formData.append('video', file);

  try {
    button.disabled = true;
    button.textContent = 'Converting...';

    const response = await fetch('http://localhost:3000/convert', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || 'Conversion failed.');
    }

    const blob = await response.blob();
    const downloadUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = file.name.replace(/\.[^/.]+$/, '') + '.mp3';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(downloadUrl);
  } catch (err) {
    console.error('Conversion error:', err);
    alert('Something went wrong: ' + err.message);
  } finally {
    button.disabled = false;
    button.textContent = 'Convert';
  }
});

const convertBtn = document.getElementById('convertBtn');
convertBtn.addEventListener('click', () => {
  convertBtn.classList.add('clicked');
  setTimeout(() => convertBtn.classList.remove('clicked'), 200);
});
