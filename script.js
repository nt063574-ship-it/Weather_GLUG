WEATHER_API_ENDPOINT = `https://api.openweathermap.org/data/2.5/weather?appid=9d3b9215fe9d5fa1c80be699deef74d4&units=metric&q=`;
WEATHER_DATA_ENDPOINT = `https://api.openweathermap.org/data/2.5/forecast?appid=9d3b9215fe9d5fa1c80be699deef74d4&units=metric&q=`;

const userlocation = document.getElementById("userlocation"),
    converter = document.getElementById("converter"),
    Forecast = document.querySelector(".Forecast"),
    weatherIcon = document.querySelector(".weather-icon"),
    date = document.querySelector(".date"),
    temperture = document.querySelector(".temperature"),
    feelslike = document.querySelector(".feelsLike"),
    description = document.querySelector(".description"),
    city = document.querySelector(".city"),
    Hvalue = document.getElementById("Hvalue"),
    WValue = document.getElementById("WValue"),
    PValue = document.getElementById("PValue"),
    SRValue = document.getElementById("SRvalue"),
    SSetValue = document.getElementById("SSet"),
    CValue = document.getElementById("CValue"),
    UVValue = document.getElementById("UVValue");

function finduserlocation() {
    Forecast.innerHTML = "";
    fetch(WEATHER_API_ENDPOINT + userlocation.value)
        .then((response) => response.json())
        .then((data) => {
            console.log(data);
            if (data.cod !== 200) {
                alert(data.message);
                return;
            }
            city.innerHTML = data.name + ", " + data.sys.country;
            const weatherMain = data.weather[0].main;


            applyWeatherBackground(weatherMain);
            weatherIcon.style.background = `url(https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png)`;
            fetch(WEATHER_DATA_ENDPOINT + data.name
            ).then((response) => response.json())
                .then((data) => {
                    console.log(data);
                    temperture.innerHTML = TemperatureConverter(data.list[0].main.temp);


                    const option = {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                        hour: "numeric",
                        minute: "numeric",
                        hour12: true,
                    };
                    date.innerHTML = data.list[0].dt_txt;
                    feelslike.innerHTML = "Feels Like" + TemperatureConverter(data.list[0].main.feels_like);

                    description.innerHTML = `<i class="fa-brands fa-cloudversify"></i> &nbsp;` +
                        data.list[0].weather[0].description;

                    Hvalue.innerHTML = data.list[0].main.humidity + `<span>%</span>`;
                    WValue.innerHTML = data.list[0].wind.speed + `<span>m/s</span>`;


                    const option1 = {
                        hour: "numeric",
                        minute: "numeric",
                        hour12: true,
                    };

                    SRValue.innerHTML = SRValue.innerHTML = formatUnixTime(
                        data.city.sunrise,
                        data.city.timezone,
                        { hour: "numeric", minute: "numeric", hour12: true }
                    );
                    SSetValue.innerHTML = formatUnixTime(
                        data.city.sunset,
                        data.city.timezone,
                        { hour: "numeric", minute: "numeric", hour12: true }
                    );
                    CValue.innerHTML = data.list[0].clouds.all + `<span>%</span>`;
                    UVValue.innerHTML = "N/A";
                    PValue.innerHTML =
                        data.list[0].main.pressure + `<span>hPa</span>`;
                    const dailyMap = {};

                    data.list.forEach((weather) => {
                        console.log(weather);
                        // let div = document.createElement('div');
                        let dateKey = weather.dt_txt.split(" ")[0];

                        if (!dailyMap[dateKey]) {
                            dailyMap[dateKey] = {
                                temp_min: weather.main.temp_min,
                                temp_max: weather.main.temp_max,
                                weather: weather.weather[0],
                                dt_txt: weather.dt_txt
                            };
                        } else {
                            dailyMap[dateKey].temp_min = Math.min(dailyMap[dateKey].temp_min, weather.main.temp_min);
                            dailyMap[dateKey].temp_max = Math.max(dailyMap[dateKey].temp_max, weather.main.temp_max);
                        }
                    });
                    Object.values(dailyMap).slice(0, 5).forEach((weather) => {
                        console.log(weather);


                        let div = document.createElement('div');

                        let daily = new Date(weather.dt_txt).toLocaleDateString("en-US", { weekday: "long" });
                        div.innerHTML += daily;

                        div.innerHTML += `<img src="https://openweathermap.org/img/wn/${weather.weather.icon}@2x.png" />`;

                        div.innerHTML += `<p class="forecast-desc">${weather.weather.description}</p>`;

                        div.innerHTML += `<span>
                           <span>${TemperatureConverter(weather.temp_max)}</span>  
                        <span>${TemperatureConverter(weather.temp_min)}</span>
                       </span>`;

                        Forecast.append(div);


                    });
                })
                .catch((error) => {
                    console.error("Error fetching weather data:", error);
                });
        })
        .catch((error) => {
            console.error("Error fetching weather data:", error);
        });


    function formatUnixTime(epochTime, utcOffsetSeconds, options = {}) {
        const date = new Date((epochTime + utcOffsetSeconds) * 1000);
        return date.toLocaleTimeString([], { timeZone: "UTC", ...options });
    }
    function getLongFormatUnixTime(epochTime, utcOffsetSeconds, options) {
        return formatUnixTime(epochTime, utcOffsetSeconds, options);
    }

    function TemperatureConverter(temp) {
        let cTemp = Math.round(temp);
        let message = "";
        if (converter.value == "°C") {
            message = `<span class="temp-num">${cTemp}</span><span class="temp-unit">°C</span>`;

        } else {
            var cTof = (cTemp * 9) / 5 + 32;
            message = `<span class="temp-num">${cTof}</span><span class="temp-unit">°F</span>`;
        }
        return message;
    }

}

const toggle = document.getElementById("darkToggle");

toggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");

    if (document.body.classList.contains("dark")) {
        toggle.classList.replace("fa-moon", "fa-sun");
        localStorage.setItem("theme", "dark");
    } else {
        toggle.classList.replace("fa-sun", "fa-moon");
        localStorage.setItem("theme", "light");
    }
});

if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
    toggle.classList.replace("fa-moon", "fa-sun");
}

function getLiveLocationWeather() {
    if (!navigator.geolocation) {
        console.log("Geolocation not supported");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            getCityFromCoords(lat, lon);
        },
        (error) => {
            console.log("Location permission denied");
        }
    );
}

async function getCityFromCoords(lat, lon) {
    const apiKey = "9d3b9215fe9d5fa1c80be699deef74d4";
    const url = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`;

    try {
        const res = await fetch(url);
        const data = await res.json();

        if (data && data.length > 0) {
            const city = data[0].name;
            document.getElementById("userlocation").value = city;
            finduserlocation();
        }
    } catch (err) {
        console.log("Error fetching city from coords");
    }
}
window.addEventListener("load", () => {
    getLiveLocationWeather();
});




function resetWeatherClasses() {
    document.body.classList.remove(
        "rainy",
        "sunny",
        "cloudy"
    );
}


function applyWeatherBackground(weatherMain) {
    resetWeatherClasses();

    if (weatherMain === "Rain") {
        document.body.classList.add("rainy");
    }
    else if (weatherMain === "Clear") {
        document.body.classList.add("sunny");
    }
    else if (weatherMain === "Clouds") {
        document.body.classList.add("cloudy");
    }
}
const cityInput = document.getElementById("userlocation");

cityInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        finduserlocation();
    }
});



