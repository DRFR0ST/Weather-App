class WeatherApp {
  constructor() {
    this.units = {
      metric: {
        temp: "C",
        wind: "m/s"
      },
      imperial: {
        temp: "F",
        wind: "m/h"
      }
    }
    this.unitSystem = "metric";
    this.input = document.getElementById("cityInput");
    this.submitBtn = document.getElementById("citySubmit");
    this.listeners();
    this.getCurrentLocation();

  }

  printData() {
    const data = this.data;
    this.input.value = data.name;
    const picUrl = `img/${data.weather[0].icon}.png`;
    document.getElementById("weatherPic").setAttribute("src", picUrl);
    document.getElementById("temp").innerHTML = `${data.main.temp}\&deg;<span class="degree">${this.units[this.unitSystem].temp}</span>`;
    document.querySelector(".details-info").innerHTML = `
      <p class="description">${data.weather[0].description}</p>
      <ul class="details-list">
      <li><b>Pressure:</b> ${data.main.pressure}hPa</li>
      <li><b>Wind:</b> ${data.wind.speed}${this.units[this.unitSystem].wind}</li>
      <li><b>Cloudiness:</b> ${data.clouds.all}%</li>
      <li><b>Humidity:</b> ${data.main.humidity}%</li>
      <br />
      <li><b>Sunrise:</b> ${data.sys.sunrise}</li>
      <li><b>Sunset:</b> ${data.sys.sunset}</li>
      </ul>
    `
  }

  printError(err) {
    if (err == 404) {
      document.getElementById("modal").style.display = "flex";
      document.getElementById("modalError").innerHTML = `We haven't found this city in our database. Are you sure you typed it correctly?`;
      this.input.value = this.data.name;
    }
  }

  listeners() {
    this.submitBtn.addEventListener("click", (e) => {
      e.preventDefault();
      this.handleData(this.dataByCity(this.input.value))
    })

    let toggleBtn = document.getElementById("toggleDetails");
    toggleBtn.addEventListener("click", () => {
      // expanding details div
      if (toggleBtn.classList.contains("toggle")) {
        toggleBtn.classList.remove("toggle");
      }
      else {
        toggleBtn.classList.add("toggle");
      }
      let details = document.querySelector(".details");
      if (details.classList.contains("open")) {
        details.classList.remove("open");
      }
      else {
        details.classList.add("open");
      }
    })

    let unitBtns = document.querySelectorAll(".unit-btn");
    unitBtns.forEach((btn, i) => {
      btn.addEventListener("click", () => {
        if (!btn.classList.contains("active")) {
          btn.classList.add("active");
          if (i == 0) {
            unitBtns[1].classList.remove("active");
          } else {
            unitBtns[0].classList.remove("active");
          }
          // updating unit system
          this.unitSystem = btn.getAttribute("id");
          // updating data
          this.handleData(this.dataByCity(this.data.name))
        }
      })
    })

    document.getElementById("modalBtn").addEventListener("click", () => {
      document.getElementById("modal").style.display = "none";
    })
  }

  getCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(this.locationReceived.bind(this))
    }
  }

  locationReceived(location) {
    const lat = location.coords.latitude;
    const lon = location.coords.longitude;
    let coordsPromise = this.dataByCoords(lat, lon);
    this.handleData(coordsPromise)
  }

  handleData(prom) {
    prom.then((data) => {
      this.data = data;
      const lat = this.data.coord.lat;
      const lon = this.data.coord.lon;
      const timestamp = this.data.dt;
      const url = `https://maps.googleapis.com/maps/api/timezone/json?location=${lat},${lon}&timestamp=${timestamp}&key=AIzaSyBt2v7Ni9EhgeYODFYFAz-HFcxdkVjg6yw`;
      return this.getData(url)
    }).then((timeData) => {
      const sunrise = new Date(this.data.sys.sunrise*1000);
      const sunset = new Date(this.data.sys.sunset*1000);
      const hrDiff = timeData.rawOffset / 3600;
      const minDiff = timeData.rawOffset % 3600;
      let SRhr = sunrise.getUTCHours() + hrDiff;
      let SRmin = sunrise.getUTCMinutes() + minDiff;
      let SShr = sunset.getUTCHours() + hrDiff;
      SShr = SShr < 0 ? 24+SShr : SShr;
      SRhr = SRhr >= 24 ? SRhr-24 : SRhr;
      let SSmin = sunset.getUTCMinutes() + minDiff;
      SShr = SShr < 10 ? "0" + SShr.toString() : SShr.toString();
      SSmin = SSmin < 10 ? "0" + SSmin.toString() : SSmin.toString();
      SRhr = SRhr < 10 ? "0" + SRhr.toString() : SRhr.toString();
      SRmin = SRmin < 10 ? "0" + SRmin.toString() : SRmin.toString();
      this.data.sys.sunrise = SRhr + ":" + SRmin;
      this.data.sys.sunset = SShr + ":" + SSmin;

      this.printData();
    }).catch((err) => {
      this.printError(err);
    })
  }

  dataByCoords(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${this.unitSystem}&appid=82a6681567e9644f377a9057d6932ed1`;
    return this.getData(url);
  }

  dataByCity(city) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${this.unitSystem}&appid=82a6681567e9644f377a9057d6932ed1`;
    return this.getData(url);
  }

  getData(url) {
    return new Promise((resolve, reject) => {
      const method = "GET";
      let xhr = new XMLHttpRequest();
      xhr.open(method, url, true)
      xhr.onload = () => {
        if (xhr.status === 200) {
          resolve(JSON.parse(xhr.response));
        }
        else {
          reject(xhr.status);
        }
      }
      xhr.send(null);
    })
  }

} // class
