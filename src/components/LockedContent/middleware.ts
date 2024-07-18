// This counter is shown at the bottom of the page and incremented
// each time "show content" button is clicked
function incrementUnlockCounter(id: string | undefined) {
  if (id) {
    fetch(`http://localhost:3000/api/location/increment/${id}`, {
      method: "PATCH",
    });
  }
}

export { incrementUnlockCounter };
