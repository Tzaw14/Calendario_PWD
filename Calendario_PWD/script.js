class Calendar {
    constructor() {
        this.monthNames = [
            "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
            "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
        ];
        this.weekdayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
        this.today = new Date();
        this.currentMonth = this.today.getMonth();
        this.currentYear = this.today.getFullYear();

        this.datesContainer = document.getElementById("dates");
        this.monthDisplay = document.getElementById("month");
        this.yearDisplay = document.getElementById("year");
        this.prevBtn = document.getElementById("prev-month");
        this.nextBtn = document.getElementById("next-month");

        this.holidays = {
            "01-01": "Año Nuevo",
            "02-24": "Carnaval",
            "02-25": "Carnaval",
            "03-24": "Día de la Memoria",
            "04-02": "Día de Malvinas",
            "04-18": "Viernes Santo",
            "05-01": "Día del Trabajador",
            "05-25": "Revolución de Mayo",
            "06-17": "Día de Güemes",
            "06-20": "Día de la Bandera",
            "07-09": "Día de la Independencia",
            "08-17": "Día de San Martín",
            "10-12": "Día de la Diversidad Cultural",
            "11-20": "Día de la Soberanía",
            "12-08": "Inmaculada Concepción",
            "12-25": "Navidad",
            "12-26": "Feriado turístico"
        };

        this.loadEventsFromStorage();

        this.initEventListeners();
        this.loadCalendar(this.currentMonth, this.currentYear);
        this.initEventForm();
    }

    loadEventsFromStorage() {
        this.events = JSON.parse(localStorage.getItem('calendarEvents')) || {};
    }

    saveEventsToStorage() {
        localStorage.setItem('calendarEvents', JSON.stringify(this.events));
    }

    initEventListeners() {
        this.prevBtn.addEventListener("click", () => this.navigateMonth(-1));
        this.nextBtn.addEventListener("click", () => this.navigateMonth(1));

        const todayBtn = document.getElementById("today-btn") || this.createTodayButton();
        todayBtn.addEventListener("click", () => {
            this.currentMonth = this.today.getMonth();
            this.currentYear = this.today.getFullYear();
            this.loadCalendar(this.currentMonth, this.currentYear);
        });

        document.addEventListener("daySelected", (e) => {
            this.showEventForm(e.detail);
        });
    }

    createTodayButton() {
        const todayBtn = document.createElement("button");
        todayBtn.id = "today-btn";
        todayBtn.textContent = "Hoy";
        todayBtn.className = "calendar-btn";

        this.nextBtn.parentNode.insertBefore(todayBtn, this.nextBtn.nextSibling);
        return todayBtn;
    }

    initEventForm() {
        if (document.getElementById("event-form")) return;

        const formContainer = document.createElement("div");
        formContainer.id = "event-form-container";
        formContainer.classList.add("event-form-container", "hidden");

        formContainer.innerHTML = `
        <div class="event-form-header">
          <h3>Agregar evento para <span id="selected-date"></span></h3>
          <button id="close-form" class="close-btn">×</button>
        </div>
        <form id="event-form">
          <div class="form-group">
            <label for="event-title">Título del evento:</label>
            <input type="text" id="event-title" required placeholder="Título">
          </div>
          <div class="form-group">
            <label for="event-type">Tipo de evento:</label>
            <select id="event-type">
              <option value="default">General</option>
              <option value="trabajo">Trabajo</option>
              <option value="personal">Personal</option>
              <option value="importante">Importante</option>
            </select>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn save-btn">Guardar</button>
            <button type="button" class="btn delete-btn" id="delete-event" style="display:none">Eliminar</button>
          </div>
          <input type="hidden" id="event-date">
        </form>
      `;

        document.body.appendChild(formContainer);

        document.getElementById("close-form").addEventListener("click", () => {
            formContainer.classList.add("hidden");
        });

        document.getElementById("event-form").addEventListener("submit", (e) => {
            e.preventDefault();

            const dateStr = document.getElementById("event-date").value;
            const title = document.getElementById("event-title").value;
            const type = document.getElementById("event-type").value;

            this.addEvent(dateStr, title, type);
            formContainer.classList.add("hidden");
        });

        document.getElementById("delete-event").addEventListener("click", () => {
            const dateStr = document.getElementById("event-date").value;
            this.removeEvent(dateStr);
            formContainer.classList.add("hidden");
        });
    }

    showEventForm(dateInfo) {
        const container = document.getElementById("event-form-container");
        const dateInput = document.getElementById("event-date");
        const titleInput = document.getElementById("event-title");
        const typeSelect = document.getElementById("event-type");
        const deleteBtn = document.getElementById("delete-event");
        const dateDisplay = document.getElementById("selected-date");

        const month = dateInfo.month + 1;
        const dateStr = `${dateInfo.year}-${String(month).padStart(2, '0')}-${String(dateInfo.day).padStart(2, '0')}`;

        dateInput.value = dateStr;
        dateDisplay.textContent = dateInfo.formattedDate;

        if (this.events[dateStr]) {
            titleInput.value = this.events[dateStr].title;
            typeSelect.value = this.events[dateStr].type;
            deleteBtn.style.display = "inline-block";
        } else {
            titleInput.value = "";
            typeSelect.value = "default";
            deleteBtn.style.display = "none";
        }

        container.classList.remove("hidden");
    }

    navigateMonth(direction) {
        this.currentMonth += direction;

        if (this.currentMonth < 0) {
            this.currentMonth = 11;
            this.currentYear--;
        } else if (this.currentMonth > 11) {
            this.currentMonth = 0;
            this.currentYear++;
        }

        this.loadCalendar(this.currentMonth, this.currentYear);
    }

    isLeapYear(year) {
        return ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0);
    }

    getDaysInMonth(month, year) {
        const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

        if (month === 1 && this.isLeapYear(year)) {
            return 29;
        }

        return daysInMonth[month];
    }

    loadCalendar(month, year) {
        this.datesContainer.innerHTML = "";

        this.monthDisplay.textContent = this.monthNames[month];
        this.yearDisplay.textContent = year;

        const firstDay = new Date(year, month, 1).getDay();

        const totalDays = this.getDaysInMonth(month, year);

        const prevMonth = month === 0 ? 11 : month - 1;
        const prevYear = month === 0 ? year - 1 : year;
        const prevMonthDays = this.getDaysInMonth(prevMonth, prevYear);

        this.createWeekdayHeaders();

        for (let i = firstDay - 1; i >= 0; i--) {
            const day = this.createDayElement(prevMonthDays - i, true);
            day.classList.add("prev-month");
            this.datesContainer.appendChild(day);
        }

        for (let i = 1; i <= totalDays; i++) {
            const day = this.createDayElement(i, false);

            if (this.isToday(i, month, year)) {
                day.classList.add("today");
            }

            const holidayKey = `${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            if (this.holidays[holidayKey]) {
                day.classList.add("holiday");
                day.setAttribute("title", this.holidays[holidayKey]);
            }

            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            if (this.events[dateStr]) {
                day.classList.add("event");
                day.setAttribute("title", this.events[dateStr].title);

                if (this.events[dateStr].type) {
                    day.classList.add(`event-${this.events[dateStr].type}`);
                }

                const eventIndicator = document.createElement("div");
                eventIndicator.className = `event-indicator ${this.events[dateStr].type}`;
                day.appendChild(eventIndicator);
            }

            day.addEventListener("click", () => this.selectDay(day, i, month, year));

            this.datesContainer.appendChild(day);
        }

        const totalCells = 42; // 6 filas x 7 columnas
        const nextMonthDays = totalCells - (firstDay + totalDays);

        for (let i = 1; i <= nextMonthDays; i++) {
            const day = this.createDayElement(i, true);
            day.classList.add("next-month");
            this.datesContainer.appendChild(day);
        }
    }

    createWeekdayHeaders() {
        if (!document.querySelector(".calendar-weekdays")) {
            const weekdaysContainer = document.createElement("div");
            weekdaysContainer.className = "calendar-weekdays";

            this.weekdayNames.forEach(dayName => {
                const dayHeader = document.createElement("div");
                dayHeader.className = "weekday";
                dayHeader.textContent = dayName;
                weekdaysContainer.appendChild(dayHeader);
            });

            this.datesContainer.parentNode.insertBefore(weekdaysContainer, this.datesContainer);
        }
    }

    createDayElement(dayNumber, disabled) {
        const day = document.createElement("div");
        day.classList.add("day");

        const dayNumberElement = document.createElement("span");
        dayNumberElement.classList.add("day-number");
        dayNumberElement.textContent = dayNumber;
        day.appendChild(dayNumberElement);

        if (disabled) {
            day.classList.add("disabled");
        }

        return day;
    }

    isToday(day, month, year) {
        return (
            day === this.today.getDate() &&
            month === this.today.getMonth() &&
            year === this.today.getFullYear()
        );
    }

    selectDay(dayElement, day, month, year) {
        const selectedDay = document.querySelector(".day.selected");
        if (selectedDay) {
            selectedDay.classList.remove("selected");
        }

        if (!dayElement.classList.contains("disabled")) {
            dayElement.classList.add("selected");

            const formattedDate = `${day} de ${this.monthNames[month]} de ${year}`;

            const event = new CustomEvent("daySelected", {
                detail: {
                    day,
                    month,
                    year,
                    formattedDate,
                    element: dayElement
                }
            });
            document.dispatchEvent(event);
        }
    }

    addEvent(date, title, type = "default") {
        this.events[date] = { title, type };

        this.saveEventsToStorage();

        this.loadCalendar(this.currentMonth, this.currentYear);
    }

    removeEvent(date) {
        if (this.events[date]) {
            delete this.events[date];

            this.saveEventsToStorage();

            this.loadCalendar(this.currentMonth, this.currentYear);
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const myCalendar = new Calendar();

    myCalendar.addEvent("2025-03-20", "Reunión importante", "trabajo");
    myCalendar.addEvent("2025-03-25", "Cumpleaños de Ana", "personal");

    const style = document.createElement('style');
    style.textContent = `   
        /* Estilo para días con eventos */
        .day.event {
        position: relative;
        font-weight: bold;
        text-shadow: 0 0 8px #FFD700;
        }
        
        /* Indicador de evento */
        .event-indicator {
        position: absolute;
        bottom: 2px;
        left: 50%;
        transform: translateX(-50%);
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background-color: #FFD700;
        box-shadow: 0 0 10px #FFD700;
        }
        
        /* Tipos de eventos */
        .event-indicator.trabajo { background-color: #2de30e; box-shadow: 0 0 10px #2de30e; }
        .event-indicator.personal { background-color: #39ff14; box-shadow: 0 0 10px #39ff14; }
        .event-indicator.importante { background-color: #ff4500; box-shadow: 0 0 10px #ff4500; }
        
        /* Estilo para días festivos */
        .day.holiday {
        background-color: #ff4500;
        color: black;
        font-weight: bold;
        text-shadow: 0 0 10px #ff4500;
        }
        
        /* Estilo para el día actual */
        .day.today {
        background-color: #FFD700;
        color: black;
        font-weight: bold;
        box-shadow: 0 0 10px #FFD700;
        }
        
        /* Estilos para el formulario de eventos */
        .event-form-container {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: black;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 0 15px #39ff14;
        width: 300px;
        z-index: 1000;
        color: #39ff14;
        }
        
        .event-form-container.hidden {
        display: none;
        }
        
        .event-form-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
        color: #FFD700;
        text-shadow: 0 0 5px #FFD700;
        }
        
        .form-group {
        margin-bottom: 15px;
        }
        
        .form-group label {
        display: block;
        margin-bottom: 5px;
        color: #FFD700;
        text-shadow: 0 0 5px #FFD700;
        }
        
        .form-group input,
        .form-group select {
        width: 100%;
        padding: 8px;
        border: 1px solid #39ff14;
        border-radius: 4px;
        background-color: black;
        color: #39ff14;
        box-shadow: 0 0 5px #39ff14;
        }
        
        .form-actions {
        display: flex;
        justify-content: space-between;
        }
        
        .btn {
        padding: 8px 15px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-weight: bold;
        box-shadow: 0 0 10px #FFD700;
        }
        
        .save-btn {
        background-color: #39ff14;
        color: black;
        }
        
        .delete-btn {
        background-color: #ff4500;
        color: black;
        }
        
        .close-btn {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #FFD700;
        text-shadow: 0 0 5px #FFD700;
        }

    `;
    document.head.appendChild(style);

    window.calendar = myCalendar;
});