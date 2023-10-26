

export function getRandomID({ n = 5 }){
        let idString = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        let counter = 0;
        while (counter < n) {
            idString += characters.charAt(Math.floor(Math.random() * charactersLength));
          counter += 1;
        }
        return idString;
    }