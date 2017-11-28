import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { UploadOutput, UploadInput, UploadFile, humanizeBytes } from 'ngx-uploader';
import { AuthService } from "../../services/auth.service";
import { LoadingService }         from '../../services/loading.service';
import { Playlist } from '../../models/playlist';

@Component({
    selector: 'my-fileupload',
    templateUrl: 'fileupload.component.html',
    styleUrls: [ './fileupload.component.css' ]
})

export class FileUploadComponent implements OnInit {
    formData: FormData;
    files: UploadFile[];
    uploadInput: EventEmitter<UploadInput>;
    humanizeBytes: Function;
    dragOver: boolean;
    filecount: number = 0;
    readycount: number = 0;
    @Input() currentPlaylist: Playlist;
    @Output() loadComplited: EventEmitter<any> = new EventEmitter();
    constructor(
        private authService : AuthService,
        private router: Router,
        private loadingService: LoadingService
    )
    {
        this.files = []; // local uploading files array
        this.uploadInput = new EventEmitter<UploadInput>(); // input events, we use this to emit data to ngx-uploader
        this.humanizeBytes = humanizeBytes;
    }
    ngOnInit() { }

    onUploadOutput(output: UploadOutput): void {
        console.log(output); // lets output to see what's going on in the console

        if (output.type === 'allAddedToQueue') { // when all files added in queue
        // uncomment this if you want to auto upload files when added
            this.loadingService.setLoading(true);
            let token = this.authService.getLocalToken();
            const event: UploadInput = {
                type: 'uploadAll',
                url: '/api/fileupload/'+this.currentPlaylist.Id,
                method: 'POST',
                fieldName: 'files',
                headers: { 'Authorization': 'Bearer '+ token},
                concurrency: 1 // set sequential uploading of files with concurrency 1
            };
            this.uploadInput.emit(event);
        } else if (output.type === 'addedToQueue') {
            this.filecount++;
            this.files.push(output.file); // add file to array when added
        } else if (output.type === 'uploading') {
            // update current data in files array for uploading file
            const index = this.files.findIndex(file => file.id === output.file.id);
            this.files[index] = output.file;
        } else if (output.type === 'removed') {
            // remove file from array when removed
            this.files = this.files.filter((file: UploadFile) => file !== output.file);
        } else if (output.type === 'dragOver') { // drag over event
            this.dragOver = true;
        } else if (output.type === 'dragOut') { // drag out event
            this.dragOver = false;
        } else if (output.type === 'drop') { // on drop event
            this.filecount = 0;
            this.readycount = 0;
            this.dragOver = false;
        } else if (output.type === 'done') { // on done event
            this.dragOver = false;
            this.readycount++;
            if(this.readycount >= this.filecount)
            {
                this.loadingService.setLoading(false);
                this.loadComplited.emit(null);
            }
            if(output.file.response == "NO_DISC_SPACE")
            {
                var message = "No more disc space for you anymore";
                alert(message);
            }
            else
            {
                console.log(output.file.response);
            }
        }
    }
    startUpload(): void {  // manually start uploading
        let token = this.authService.getLocalToken();
        const event: UploadInput = {
            type: 'uploadAll',
            url: '/api/fileupload/'+this.currentPlaylist.Id,
            fieldName: 'files',
            method: 'POST',
            headers: { 'Authorization': 'Bearer '+ token},
            concurrency: 1 // set sequential uploading of files with concurrency 1
        }

        this.uploadInput.emit(event);
    }
    cancelUpload(id: string): void {
        this.uploadInput.emit({ type: 'cancel', id: id });
    }
}