CREATE TABLE tb_exame (
  id_exame      SERIAL NOT NULL, 
  nm_exame      varchar(250) NOT NULL, 
  id_exame_tipo int4 NOT NULL, 
  fl_status     bool NOT NULL, 
  PRIMARY KEY (id_exame));
CREATE TABLE tb_exame_tipo (
  id_exame_tipo SERIAL NOT NULL, 
  nm_exame_tipo varchar(250) NOT NULL, 
  PRIMARY KEY (id_exame_tipo));
CREATE TABLE tb_lab_exame (
  id_lab_exame   SERIAL NOT NULL, 
  id_laboratorio int4 NOT NULL, 
  id_exame       int4 NOT NULL, 
  PRIMARY KEY (id_lab_exame), 
  CONSTRAINT uk_labExame 
    UNIQUE (id_laboratorio, id_exame));
CREATE TABLE tb_laboratorio (
  id_laboratorio SERIAL NOT NULL, 
  nm_laboratorio varchar(250) NOT NULL, 
  dt_cadastro    timestamp NOT NULL, 
  ds_endereco    varchar(250) NOT NULL, 
  fl_status      bool NOT NULL, 
  dt_exclusao    timestamp, 
  PRIMARY KEY (id_laboratorio));
ALTER TABLE tb_lab_exame ADD CONSTRAINT FKtb_lab_exa445672 FOREIGN KEY (id_laboratorio) REFERENCES tb_laboratorio (id_laboratorio);
ALTER TABLE tb_lab_exame ADD CONSTRAINT FKtb_lab_exa880991 FOREIGN KEY (id_exame) REFERENCES tb_exame (id_exame);
ALTER TABLE tb_exame ADD CONSTRAINT FKtb_exame336149 FOREIGN KEY (id_exame_tipo) REFERENCES tb_exame_tipo (id_exame_tipo);
