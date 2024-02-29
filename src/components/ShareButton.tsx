import { Button } from "./ui/button"

const ShareButton = () => {
  const shareLink = async () => {
    const shareData = {
      title: "Konulu Konum",
      text: "Surprise you're loved ones!",
      url: document.URL
    }

    await navigator.share(shareData)
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(document.URL)
      // @ts-ignore
      Toastify({
        text: "Konulu konum copied.",
        duration: 3000,
        gravity: "top", // `top` or `bottom`
        position: "center", // `left`, `center` or `right`
        stopOnFocus: true, // Prevents dismissing of toast on hover
        style: {
          background: "black",
          borderRadius: "6px",
          margin: "16px"
        },
        onClick: function () {} // Callback after click
      }).showToast()
    } catch (err: any) {
      console.error(err.message)
    }
  }

  return (
    <div>
      {
        //@ts-expect-error navigator is not always defined
        window.navigator.share ? (
          <Button className='w-full text-lg' size='lg' onClick={shareLink}>
            Share
          </Button>
        ) : (
          <Button className='w-full text-lg' size='lg' onClick={copyLink}>
            Share
          </Button>
        )
      }
    </div>
  )
}

export default ShareButton
