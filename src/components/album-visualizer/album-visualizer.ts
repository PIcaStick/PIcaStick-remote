import {Component, OnInit, ViewChild} from '@angular/core';
import {Picture} from "../../models/picture";
import {ServerProvider} from "../../providers/upload/server";
import {Entry} from "@ionic-native/file";
import {Events, Slides} from "ionic-angular";

@Component({
    selector: 'album-visualizer',
    templateUrl: 'album-visualizer.html'
})
export default class AlbumVisualizerComponent implements OnInit {

    @ViewChild(Slides) slides: Slides;

    picturesFIFO: Picture[];
    currentPicture: number;

    constructor(public server: ServerProvider,
                private events: Events) {
        this.picturesFIFO = [];
        this.currentPicture = 0;
    }

    ngOnInit(): void {
        this.events.subscribe('picture:add:found', (entry: Entry) => {
            this.addPicture(entry);
        });
        this.events.subscribe("picture:delete", () => {
            this.delPicture();
        });
    }

    addPicture(entry: Entry): void {
        this.findImage(entry).then(index => {
            if (index == -1) {
                this.server.uploadToServer(entry).then(picture => {
                    this.picturesFIFO.push(picture);
                }).catch(reason => {
                    console.error(reason.message);
                });
            }
        });
    }

    delPicture(): void {
        console.log(this.picturesFIFO.length, this.currentPicture);
        if (this.picturesFIFO.length !== 0) {
            this.picturesFIFO.splice(this.currentPicture, 1);
        }
    }

    slideChanged() {
        this.currentPicture = this.slides.getActiveIndex();
        //this.server.goTo(this.picturesFIFO[this.slides.getActiveIndex()]);
    }


    findImage(needle: Entry): Promise<number> {
        return new Promise(resolve => {
            let finded = false;

            for (let i = 0; i < this.picturesFIFO.length; i++) {
                if (needle.fullPath === this.picturesFIFO[i].entry.fullPath) {
                    resolve(i);
                    finded = true;
                    break;
                }
            }

            if (!finded) {
                resolve(-1);
            }
        });
    }
}