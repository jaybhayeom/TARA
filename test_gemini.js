const apiKey = "AIzaSyCaVU5FIydlvRa-40wkg4DpeKK03twIIxY";
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

fetch(url)
.then(res => res.json())
.then(data => {
  if (data.models) {
    console.log(data.models.map(m => m.name).join("\n"));
  } else {
    console.log(JSON.stringify(data, null, 2));
  }
})
.catch(err => console.error(err));
