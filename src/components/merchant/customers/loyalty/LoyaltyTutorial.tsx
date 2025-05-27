const LoyaltyTutorial = () => {
  let url = "https://www.youtube.com/watch?v=zoFnEF-A7kQ";
  if (url.includes("watch?v=")) {
    url = url.replace("watch?v=", "embed/");
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center mb-4">
        <iframe
          className="w-full h-full rounded-lg"
          src={url}
          title="Tutoriel sur le programme de fidélité"
          allowFullScreen
        ></iframe>
      </div>
      <h3 className="font-medium text-gray-900">
        Comment optimiser votre programme de fidélité
      </h3>
      <p className="mt-2 text-sm text-gray-500">
        Découvrez les meilleures pratiques pour fidéliser vos clients et augmenter
        leur engagement.
      </p>
    </div>
  )
}

export default LoyaltyTutorial