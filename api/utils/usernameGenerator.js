import { uniqueUsernameGenerator} from 'unique-username-generator';
const Characters = [
    'woman',
    'Doctor Strange',
    'Kera-Bahadur',
    'Nepali-thito',
    'Dhido-Man',
    'pen-chor',
    'Bahun Don',
    'Kami Dai'
  ];
  
  const config= {
    dictionaries: [Characters],
    separator: '',
    style: 'capital',
  }
export default function usernameGenerator(){
  let date=new Date();
    return `${uniqueUsernameGenerator(config)+date.getMilliseconds()}`;
}


  