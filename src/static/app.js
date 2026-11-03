document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear previously rendered activities and options
      activitiesList.innerHTML = "";
      while (activitySelect.options.length > 1) {
        activitySelect.remove(1);
      }

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        const title = document.createElement("h4");
        title.textContent = name;

        const description = document.createElement("p");
        description.textContent = details.description;

        const schedule = document.createElement("p");
        const scheduleLabel = document.createElement("strong");
        scheduleLabel.textContent = "Schedule: ";
        schedule.append(scheduleLabel, details.schedule);

        const availability = document.createElement("p");
        const availabilityLabel = document.createElement("strong");
        availabilityLabel.textContent = "Availability: ";
        availability.append(availabilityLabel, `${spotsLeft} spots left`);

        const participantsSection = document.createElement("div");
        participantsSection.className = "participants-section";

        const participantsHeading = document.createElement("h5");
        participantsHeading.textContent = "Participants";
        participantsSection.appendChild(participantsHeading);

        if (details.participants.length > 0) {
          const participantsList = document.createElement("ul");
          participantsList.className = "participants-list";

          details.participants.forEach((participant) => {
            const listItem = document.createElement("li");
            listItem.className = "participant-item";

            const participantName = document.createElement("span");
            participantName.textContent = participant;

            const unregisterButton = document.createElement("button");
            unregisterButton.type = "button";
            unregisterButton.className = "participant-remove";
            unregisterButton.setAttribute(
              "aria-label",
              `Unregister ${participant} from ${name}`
            );
            unregisterButton.title = `Unregister ${participant}`;

            const removeIcon = document.createElementNS(
              "http://www.w3.org/2000/svg",
              "svg"
            );
            removeIcon.setAttribute("viewBox", "0 0 24 24");
            removeIcon.setAttribute("aria-hidden", "true");
            removeIcon.setAttribute("focusable", "false");
            const removePath = document.createElementNS(
              "http://www.w3.org/2000/svg",
              "path"
            );
            removePath.setAttribute(
              "d",
              "M9 3h6l1 2h5v2H3V5h5l1-2zm-4 6h14l-1 12H6L5 9zm4 2v8h2v-8H9zm4 0v8h2v-8h-2z"
            );
            removeIcon.appendChild(removePath);
            unregisterButton.appendChild(removeIcon);

            unregisterButton.addEventListener("click", async () => {
              unregisterButton.disabled = true;
              try {
                const response = await fetch(
                  `/activities/${encodeURIComponent(name)}/signup?email=${encodeURIComponent(participant)}`,
                  { method: "DELETE" }
                );
                const result = await response.json();

                if (!response.ok) {
                  throw new Error(result.detail || "An error occurred");
                }

                messageDiv.textContent = result.message;
                messageDiv.className = "success";
                messageDiv.classList.remove("hidden");
                await fetchActivities();
                setTimeout(() => {
                  messageDiv.classList.add("hidden");
                }, 5000);
              } catch (error) {
                messageDiv.textContent =
                  error.message || "Failed to unregister. Please try again.";
                messageDiv.className = "error";
                messageDiv.classList.remove("hidden");
                console.error("Error unregistering participant:", error);
                unregisterButton.disabled = false;
              }
            });

            listItem.append(participantName, unregisterButton);
            participantsList.appendChild(listItem);
          });

          participantsSection.appendChild(participantsList);
        } else {
          const emptyMessage = document.createElement("p");
          emptyMessage.className = "participants-empty";
          emptyMessage.textContent = "No participants yet";
          participantsSection.appendChild(emptyMessage);
        }

        activityCard.append(
          title,
          description,
          schedule,
          availability,
          participantsSection
        );

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        await fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
