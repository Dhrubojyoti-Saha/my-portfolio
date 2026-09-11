"use strict";

const menu = document.querySelector(".menu");
const nav = document.querySelector("#navigation");

menu.addEventListener("click", () => {
  const open = menu.getAttribute("aria-expanded") !== "true";

  menu.setAttribute("aria-expanded", String(open));
  nav.classList.toggle("open", open);
});

nav.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    menu.setAttribute("aria-expanded", "false");
    nav.classList.remove("open");
  }
});

document.addEventListener("keydown", (event) => {
  if (
    event.key === "Escape" &&
    nav.classList.contains("open")
  ) {
    menu.setAttribute("aria-expanded", "false");
    nav.classList.remove("open");
    menu.focus();
  }
});

document.querySelector("#year").textContent =
  new Date().getFullYear();

const replies = {
  help:
    "Commands: whoami, skills, projects, credentials, contact, clear",

  whoami:
    "Dhrubojyoti Saha | Aspiring SOC Analyst | Blue Team",

  skills:
    "Lab practice: Kali Linux, Metasploit, SQL injection testing. " +
    "Learning focus: log analysis, Python automation, detection " +
    "logic and incident reporting.",

  projects:
    "Login Threat Investigator: in progress. " +
    "Other blue-team labs: in progress. " +
    "Completed code and reports will be linked when ready.",

  credentials:
    "Microsoft Applied Skills: Defend against cyberthreats " +
    "with Microsoft Defender XDR (10 Sep 2026). " +
    "Cisco Introduction to Cybersecurity (9 Sep 2026). " +
    "Cisco career-path badge link is in Credentials.",

  contact:
    "Email: dhrubosh@gmail.com\n" +
    "LinkedIn: https://www.linkedin.com/in/dhrubojyoti-saha-88821a241/\n" +
    "GitHub: https://github.com/Dhrubojyoti-Saha"
};

const form = document.querySelector("#terminal-form");
const input = document.querySelector("#command");
const output = document.querySelector("#output");

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const command = input.value.trim().toLowerCase();
  input.value = "";

  if (!command) return;

  if (command === "clear") {
    output.replaceChildren();
    return;
  }

  const line = document.createElement("p");

  line.textContent =
    "> " + command + "\n" +
    (
      Object.prototype.hasOwnProperty.call(replies, command)
        ? replies[command]
        : 'Unknown command. Type "help".'
    );

  output.append(line);

  while (output.children.length > 12) {
    output.firstElementChild.remove();
  }

  output.scrollTop = output.scrollHeight;
});
