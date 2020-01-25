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
      this.firebase.collection(this.TAGS_ROOT_COLLECTION)
        .doc(docRef)
        .get()
        .subscribe(querySnapshot => {
          const data = querySnapshot.data();
          this.updateDoc(querySnapshot.ref, data.readCounter);
          resolve(data.link);
        });
    });

  }

  private updateDoc(doc: DocumentReference, count: number) {
    this.firebase.doc(doc).update({
      readCounter: count + 1
    });
  }

}
