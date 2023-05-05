interface Window {
    verifLink: (types: string, name: string, source: string, target: string) => void;
    verifMod: (name:string,time:number)=>void;
    setCache:(label:string,content:string)=>void;
  }
  