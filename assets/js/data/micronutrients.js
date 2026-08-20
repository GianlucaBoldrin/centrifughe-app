/**
 * Dizionario centralizzato dei micronutrienti.
 * Ogni ricetta fa riferimento a queste chiavi (vedi recipes.js -> micronutrients).
 * Le descrizioni usano formulazioni nutrizionali corrette e concise (stile EFSA),
 * senza claim terapeutici.
 */
window.MICRONUTRIENTS = {
  vitamina_c: {
    name: "Vitamina C",
    function:
      "Contribuisce alla normale funzione del sistema immunitario, alla sintesi del collagene e alla protezione delle cellule dallo stress ossidativo.",
  },
  vitamina_a: {
    name: "Vitamina A / Beta-carotene",
    function:
      "Il beta-carotene è precursore della vitamina A, importante per la normale funzione visiva, per la pelle e per il sistema immunitario.",
  },
  vitamina_k: {
    name: "Vitamina K",
    function:
      "Contribuisce alla normale coagulazione del sangue e al mantenimento di ossa normali.",
  },
  folati: {
    name: "Folati (Vitamina B9)",
    function:
      "Contribuiscono alla normale sintesi degli amminoacidi e alla normale formazione del sangue; utili nei periodi di crescita dei tessuti.",
  },
  vitamina_b6: {
    name: "Vitamina B6",
    function:
      "Contribuisce al normale metabolismo energetico e alla normale funzione del sistema nervoso.",
  },
  potassio: {
    name: "Potassio",
    function:
      "Contribuisce alla normale funzione muscolare, alla funzione del sistema nervoso e al mantenimento di una pressione sanguigna normale.",
  },
  magnesio: {
    name: "Magnesio",
    function:
      "Contribuisce al normale metabolismo energetico, alla funzione muscolare e alla riduzione di stanchezza e affaticamento.",
  },
  manganese: {
    name: "Manganese",
    function:
      "Contribuisce alla normale formazione del tessuto connettivo e alla protezione delle cellule dallo stress ossidativo.",
  },
  polifenoli: {
    name: "Polifenoli",
    function:
      "Ampia famiglia di composti vegetali con documentata attività antiossidante in vitro; contribuiscono al colore e al sapore di frutta e verdura.",
  },
  antociani: {
    name: "Antociani",
    function:
      "Pigmenti vegetali della famiglia dei polifenoli, responsabili delle tonalità rosse, viola e blu, con attività antiossidante.",
  },
  flavonoidi: {
    name: "Flavonoidi",
    function:
      "Sottogruppo dei polifenoli diffuso in agrumi e frutti; contribuiscono alle proprietà antiossidanti dell'alimento.",
  },
  licopene: {
    name: "Licopene",
    function:
      "Carotenoide di colore rosso presente soprattutto nel pomodoro e nell'anguria, con attività antiossidante.",
  },
  betalaine: {
    name: "Betalaine",
    function:
      "Pigmenti rosso-porpora tipici della barbabietola, con attività antiossidante studiata in vitro.",
  },
};
