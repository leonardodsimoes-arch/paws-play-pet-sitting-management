export const DOG_BREEDS = [
  "Australian Shepherd",
  "Beagle",
  "Bernese Mountain Dog",
  "Border Collie",
  "Boston Terrier",
  "Boxer",
  "Bulldog",
  "Cane Corso",
  "Cavalier King Charles Spaniel",
  "Chihuahua",
  "Cocker Spaniel",
  "Dachshund",
  "Doberman Pinscher",
  "French Bulldog",
  "German Shepherd",
  "Golden Retriever",
  "Great Dane",
  "Havanese",
  "Labrador Retriever",
  "Maltese",
  "Mastiff",
  "Miniature Schnauzer",
  "Mixed Breed",
  "Pembroke Welsh Corgi",
  "Pomeranian",
  "Poodle",
  "Pug",
  "Rottweiler",
  "Shih Tzu",
  "Siberian Husky",
  "Vizsla",
  "Yorkshire Terrier",
  "Other"
].sort((a, b) => {
  if (a === "Other") return 1;
  if (b === "Other") return -1;
  return a.localeCompare(b);
});