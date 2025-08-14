import type { ContentData } from "./types";

export const spanishContent: ContentData = {
  levels: {
    A0: {
      name: "Beginner A0",
      lessons: [
        {
          id: "g1",
          type: "grammar",
          title: "Ser vs. Estar",
          // The content is now referenced by a filename
          content: 'ser-vs-estar.md',
          exercise: {
            type: "fill-in-the-blank",
            questions: [
              {
                sentence: "Yo ___ de Argentina.",
                options: ["soy", "estoy"],
                answer: "soy",
                explanation:
                  "Use 'ser' for origin, which is a permanent characteristic.",
              },
              {
                sentence: "El café ___ caliente.",
                options: ["es", "está"],
                answer: "está",
                explanation:
                  "Use 'estar' for temporary conditions like temperature.",
              },
              {
                sentence: "Nosotros ___ estudiantes.",
                options: ["somos", "estamos"],
                answer: "somos",
                explanation: "Use 'ser' for identity or profession.",
              },
              {
                sentence: "Tú ___ muy triste hoy.",
                options: ["eres", "estás"],
                answer: "estás",
                explanation: "Use 'estar' for temporary emotions.",
              },
            ],
          },
        },
        {
          id: "c1",
          type: "conversation",
          title: "Basic Greetings",
          dialogue: [
            { speaker: "Ana", line: "¡Hola! ¿Cómo estás?" },
            { speaker: "Carlos", line: "¡Hola! Estoy muy bien, gracias. ¿Y tú?" },
            { speaker: "Ana", line: "Estoy bien también. Me llamo Ana." },
            {
              speaker: "Carlos",
              line: "Mucho gusto, Ana. Yo soy Carlos.",
            },
          ],
          pronunciationCheck: [
            { phrase: "Hola" },
            { phrase: "Gracias" },
            { phrase: "Mucho gusto" },
          ],
        },
      ],
    },
    A1: {
      name: "Beginner A1",
      lessons: [
        {
          id: "g2",
          type: "grammar",
          title: "Gender and Articles",
          content: 'gender-and-articles.md',
          exercise: {
            type: "fill-in-the-blank",
            questions: [
              { sentence: "Tengo ___ pregunta.", options: ["un", "una"], answer: "una", explanation: "'Pregunta' is a feminine noun, so it uses the feminine article 'una'." },
              { sentence: "___ perro es grande.", options: ["El", "La"], answer: "El", explanation: "'Perro' is a masculine noun, so it uses the masculine article 'el'." },
              { sentence: "Necesito ___ bolígrafo.", options: ["un", "una"], answer: "un", explanation: "'Bolígrafo' is a masculine noun, so it uses 'un'." },
              { sentence: "___ silla está rota.", options: ["El", "La"], answer: "La", explanation: "'Silla' is a feminine noun, so it uses 'la'." },
            ],
          },
        },
        {
          id: "g3",
          type: "grammar",
          title: "Present Tense: -ar Verbs",
          content: 'present-tense-ar.md',
          exercise: {
            type: "fill-in-the-blank",
            questions: [
              { sentence: "Yo ___ español.", options: ["hablo", "habla"], answer: "hablo", explanation: "For the subject 'yo', the correct ending for -ar verbs is -o." },
              { sentence: "Ella ___ en la oficina.", options: ["trabajas", "trabaja"], answer: "trabaja", explanation: "For the subject 'ella', the correct ending for -ar verbs is -a." },
              { sentence: "Nosotros ___ música.", options: ["escuchamos", "escuchan"], answer: "escuchamos", explanation: "For the subject 'nosotros', the correct ending for -ar verbs is -amos." },
              { sentence: "Ellos ___ la televisión.", options: ["miran", "mira"], answer: "miran", explanation: "For the subject 'ellos', the correct ending for -ar verbs is -an." },
            ],
          },
        },
        {
          id: 'a1',
          type: 'article',
          title: 'Reading: Un Día en el Mercado',
          headline: 'Un Día en el Mercado de San Miguel',
          content: [
              { type: 'paragraph', text: 'El Mercado de San Miguel, cerca de la Plaza Mayor en Madrid, es un lugar famoso. No es un supermercado normal. Es un mercado histórico con una arquitectura de hierro y cristal. Aquí, la gente no solo compra comida; también come tapas y bebe vino.' },
              { type: 'paragraph', text: 'Por la mañana, el mercado está lleno de vida. Los vendedores gritan los precios de las frutas frescas y el pescado. "¡Melones, melones dulces!", grita un hombre. El olor a jamón ibérico y queso manchego está en el aire.' },
              { type: 'quote', text: '"Para mí, el mercado es el corazón de Madrid", dice una clienta llamada Isabel. "Vengo aquí cada semana."' },
              { type: 'paragraph', text: 'Comer en el mercado es una experiencia especial. Puedes probar aceitunas de todos los colores, paella caliente y ostras frescas. Es un lugar perfecto para entender la cultura de la comida en España.' }
          ],
          comprehension: [
              { question: '¿Dónde está el Mercado de San Miguel?', options: ['En Barcelona', 'Cerca de la Plaza Mayor en Madrid', 'En Sevilla'], answer: 'Cerca de la Plaza Mayor en Madrid' },
              { question: '¿Qué hacen las personas en el mercado además de comprar?', options: ['Duermen la siesta', 'Juegan al fútbol', 'Comen tapas y beben vino'], answer: 'Comen tapas y beben vino' },
              { question: '¿Qué productos se mencionan en el artículo?', options: ['Ropa y zapatos', 'Frutas, pescado, jamón y queso', 'Libros y tecnología'], answer: 'Frutas, pescado, jamón y queso' }
          ]
        }
      ]
    },
    A2: {
      name: "Beginter A2",
      lessons: [
        {
          id: "c2",
          type: "conversation",
          title: "Ordering at a Restaurant",
          dialogue: [
            { speaker: "Camarero", line: "Buenas noches. ¿Tienen una reserva?" },
            { speaker: "Cliente", line: "Sí, una mesa para dos a nombre de García." },
            { speaker: "Camarero", line: "Perfecto. Por aquí, por favor. ¿Qué desean para beber?" },
            { speaker: "Cliente", line: "Para mí, una copa de vino tinto. Y para mi amiga, agua con gas." },
            { speaker: "Camarero", line: "Muy bien. Aquí tienen la carta." },
            { speaker: "Cliente", line: "Gracias. Para empezar, quisiera la ensalada mixta." },
            { speaker: "Camarero", line: "Excelente elección. ¿Y de segundo plato?" },
            { speaker: "Cliente", line: "Voy a probar el salmón a la plancha." },
            { speaker: "Camarero", line: "¿Algo más?" },
            { speaker: "Cliente", line: "No, eso es todo por ahora. La cuenta, por favor, cuando pueda." },
          ],
          pronunciationCheck: [
            { phrase: "¿Qué desean para beber?" },
            { phrase: "Quisiera la ensalada mixta" },
            { phrase: "La cuenta, por favor" },
          ],
        },
      ]
    },
  },
};
