import { Pipe, PipeTransform } from "@angular/core";
  
@Pipe({
  name: "toFixed",
  standalone: true
})
export class ToFixedPipe implements PipeTransform{
  transform = (value: number, digits?: number | undefined) => value.toFixed(digits);
}