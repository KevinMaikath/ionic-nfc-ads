import {Injectable} from '@angular/core';
import {AngularFirestore, DocumentReference} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  TAGS_ROOT_COLLECTION = '/tags';

  constructor(private firebase: AngularFirestore) {
  }

  getLink(docRef: string) {
    return new Promise<string>(resolve => {
      console.log('________DOCREF: ' + docRef);
      this.firebase.collection(this.TAGS_ROOT_COLLECTION)
        .doc(docRef)
        .get()
        .subscribe(querySnapshot => {
          const data = querySnapshot.data();
          console.log('__________GOT REFERENCE: ' + querySnapshot.ref);
          console.log('__________WITH COUNTER: ' + data.readCounter);
          console.log('__________WITH LINK: ' + data.link);
          this.updateDoc(querySnapshot.ref, data.readCounter);
          resolve(data.link);
        });
    });

  }

  private updateDoc(doc: DocumentReference, count: number) {
    console.log('_________UPDATE DOC');
    this.firebase.doc(doc).update({
      readCounter: count + 1
    });
  }

}
