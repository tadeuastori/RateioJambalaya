import { Component, OnInit } from '@angular/core';
import { FormGroup, FormArray, FormBuilder, FormControl } from '@angular/forms';

@Component({
  selector: 'app-apportionment',
  templateUrl: './apportionment.component.html',
  styleUrls: ['./apportionment.component.css'],
})
export class ApportionmentComponent implements OnInit {

  version: string = "v2.0";
  debugMode: boolean = true;
  apportionmentForm: FormGroup;

  constructor(private fb: FormBuilder) {  }

  ngOnInit(): void {
    this.formInit();
  }

  formInit(){
    this.apportionmentForm = this.fb.group({
      eventos: this.fb.array([])
    })

    const eventos = this.apportionmentForm.get('eventos') as FormArray;

    eventos.push(this.fb.group({
      nomeEvento: null,
      valorEvento: 0.00,      
      qtdDiasEvento: 1,
      participantes: this.fb.array([])
    }));
  }



  getEventos() {
    return this.apportionmentForm.get('eventos') as FormArray;
  }

  getFilteredEventos() {
    return this.getEventos().controls.filter(x => x.get('nomeEvento')?.value != null && x.get('qtdDiasEvento')?.value != null);
  }

  getParticipantes(index: number) {
    return this.getEventos().at(index).get('participantes') as FormArray;
  }

  getFilteredParticipantes(idxEvento: number) {
    return this.getParticipantes(idxEvento).controls.filter(x => x.get('nomeParticipante')?.value != null && x.get('qtdDiasParticipou')?.value != null);
  }

  getItems(idxEvento: number, idxParticipante: number){
    return this.getParticipantes(idxEvento).at(idxParticipante).get('itemsFornecidos') as FormArray;
  }



  hasEventos(){
    return this.getEventos()?.controls.filter(x => x.get('nomeEvento')?.value != null && x.get('qtdDiasEvento')?.value != null && x.get('nomeEvento')?.value.length > 0).length > 0
  }

  hasParticipante(idxEvento: number){
    return this.getParticipantes(idxEvento)?.controls.filter(x => x.get('nomeParticipante')?.value != null && x.get('qtdDiasParticipou')?.value != null && x.get('nomeParticipante')?.value.length > 0).length > 0
  }

  hasItems(idxEvento: number, idxParticipante: number){
    return this.getItems(idxEvento, idxParticipante)?.controls.length > 0
  }



  addEvento() {
    const eventoFrom = this.fb.group({
      nomeEvento: null,
      valorEvento: 0.00,      
      qtdDiasEvento: 1,
      participantes: this.fb.array([])
    });

    this.getEventos().push(eventoFrom);
  }

  addParticipante(index: number, qtdDiasEvento: number) {
    const participanteFrom = this.fb.group({
      nomeParticipante: null,      
      valorContribuido: null,
      rateio: null,
      qtdDiasParticipou: qtdDiasEvento,
      itemsFornecidos: this.fb.array([])
    });

    this.getParticipantes(index).push(participanteFrom);
    this.calcularContribuicao(index);
  }

  addItem(idxEvento: number, idxParticipante: number){
    const itemFrom = this.fb.group({
      nomeItem: null,
      valorItem: null,
      addTaxas: false
    });

    this.getItems(idxEvento, idxParticipante).push(itemFrom);

    this.checkValorContribuido(idxEvento, idxParticipante);
  }

  


  removeEvento(index: number) {
    this.getEventos().removeAt(index);
  }

  removeParticipante(idxEvento: number, idxParticipante: number) {
    this.getParticipantes(idxEvento).removeAt(idxParticipante);
  }

  removeItem(idxEvento: number, idxParticipante: number, idxItem: number) {
    this.getItems(idxEvento, idxParticipante).removeAt(idxItem);

    if(this.hasItems(idxEvento, idxParticipante) != true) {
      this.getParticipantes(idxEvento).at(idxParticipante).get('valorContribuido')?.patchValue(null);
    }
  }

  removeItens(idxEvento: number, idxParticipante: number) {
    for (let index = this.getItems(idxEvento, idxParticipante).length-1; index >= 0; index--) {      
      this.removeItem(idxEvento, idxParticipante, index);      
    }

    this.sumContribuicaoParticipante(idxEvento,idxParticipante);
    this.calcularContribuicao(idxEvento);
  }



  checkValorContribuido(idxEvento: number, idxParticipante: number){
    if(this.hasItems(idxEvento, idxParticipante)){
      const valor = this.getParticipantes(idxEvento).at(idxParticipante).get('valorContribuido');
      valor?.patchValue(null);      
    } 
  }

  sumContribuicaoParticipante(idxEvento: number, idxParticipante: number) {

    let soma: number = 0;

    for (let index = 0; index < this.getItems(idxEvento, idxParticipante).length; index++) {
      const element = this.getItems(idxEvento, idxParticipante).at(index);     

      if(!!element.get('valorItem')?.value){

        if(element.get('addTaxas')?.value == true){

          const fed = element.get('valorItem')?.value * 0.05;
          const prov = element.get('valorItem')?.value * 0.09975;
  
          soma += (Number(element.get('valorItem')?.value) + fed + prov);
  
        } else {
          soma += Number(element.get('valorItem')?.value);
        }      
      }
      
      this.getParticipantes(idxEvento).at(idxParticipante).get('valorContribuido')?.patchValue(soma.toFixed(2));
    }   

    this.sumTotalEvento(idxEvento);
  }

  sumTotalEvento(idxEvento: number){

    let soma: number = 0;

    for (let index = 0; index < this.getFilteredParticipantes(idxEvento).length; index++) {
      const element = this.getFilteredParticipantes(idxEvento)[index];
      
      if(!!element.get('valorContribuido')?.value){
        soma += Number(element.get('valorContribuido')?.value);
      }
      
    }

    this.getFilteredEventos()[idxEvento]?.get('valorEvento')?.patchValue(soma.toFixed(2));
    this.calcularContribuicao(idxEvento);
  }


  calcularContribuicao(idxEvento: number){

    let rateio: string = '';

    if(!this.getFilteredEventos()[idxEvento]?.get('valorEvento')?.value){
      return;
    }

    const vlrEvento = Number(this.getFilteredEventos()[idxEvento].get('valorEvento')?.value);
    const qtdDiasEvento = Number(this.getFilteredEventos()[idxEvento].get('qtdDiasEvento')?.value);
    const vlrEventoDia = vlrEvento / qtdDiasEvento;

    const qtdParticipante = this.getFilteredParticipantes(idxEvento).length;
    const totalRateio = vlrEvento / qtdParticipante;
    const qtdCota = this.getFilteredParticipantes(idxEvento).reduce((sum, x) => { return Number(sum) + Number(x.get("qtdDiasParticipou")?.value) }, 0);

    for (let index = 0; index < this.getFilteredParticipantes(idxEvento).length; index++) {
      const participante = this.getFilteredParticipantes(idxEvento)[index];
      rateio = '';

      if(this.getFilteredParticipantes(idxEvento).filter(x => x.get("qtdDiasParticipou")?.value != qtdDiasEvento).length == 0) {

        if(!participante.get('valorContribuido')?.value){

          if(!!vlrEvento){
            rateio = String(totalRateio.toFixed(2)) + ' $ a contribuir';
          }          
          
        } else {  
  
          if(Number(participante.get('valorContribuido')?.value) > totalRateio){
            rateio = String((Number(participante.get('valorContribuido')?.value) - totalRateio).toFixed(2)) + ' $ a receber';
          }  
          if(Number(participante.get('valorContribuido')?.value) < totalRateio){
            rateio = String((totalRateio - Number(participante.get('valorContribuido')?.value)).toFixed(2)) + ' $ a contribuir';
          }  
          if(Number(participante.get('valorContribuido')?.value) == totalRateio){
            rateio = 'Deu bom';
          }
                 
        }

      } else {

        const vlrValorCota = vlrEvento / qtdCota;

        if(!participante.get('valorContribuido')?.value){

          if(!!vlrEvento){
            rateio = String((vlrValorCota * Number(participante.get("qtdDiasParticipou")?.value)).toFixed(2)) + ' $ a contribuir';
          }          
          
        } else {  

        if(Number(participante.get('valorContribuido')?.value) > (vlrValorCota * Number(participante.get("qtdDiasParticipou")?.value))){
          rateio = String((Number(participante.get('valorContribuido')?.value) - (vlrValorCota * Number(participante.get("qtdDiasParticipou")?.value))).toFixed(2)) + ' $ a receber';
        }  

        if(Number(participante.get('valorContribuido')?.value) < (vlrValorCota * Number(participante.get("qtdDiasParticipou")?.value))){
          rateio = String(((vlrValorCota * Number(participante.get("qtdDiasParticipou")?.value)) - Number(participante.get('valorContribuido')?.value)).toFixed(2)) + ' $ a contribuir';
        }

        if(Number(participante.get('valorContribuido')?.value) == (vlrValorCota * Number(participante.get("qtdDiasParticipou")?.value))){
          rateio = 'Deu bom';
        } 
                 
        }        

      }   

      participante.get('rateio')?.patchValue(rateio);
    }

  }

  lstQtdDiasEvento(idxEvento: number) : Array<null> {
    return new Array(Number(this.getFilteredEventos()[idxEvento]?.get("qtdDiasEvento")?.value));
  }

  checkBadge(texto: string, procurar: string){

    if(!texto || !procurar) return

    return texto.includes(procurar);
  }

}
