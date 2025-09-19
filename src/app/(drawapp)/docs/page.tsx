import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/src/components/ui/accordion';

export default function DocsPage() {
  return (
    <Accordion
      type='single'
      collapsible
      className='w-full'
      defaultValue='intro'
    >
      <AccordionItem value='intro'>
        <AccordionTrigger>Overview</AccordionTrigger>
        <AccordionContent>
          DrawStudio es un editor visual que combina Next.js, TRPC y tldraw
          para ofrecer una experiencia fluida de dibujo con IA integrada.
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value='start'>
        <AccordionTrigger>Getting Started</AccordionTrigger>
        <AccordionContent className='space-y-2'>
          <p>
            • Haz clic en <strong>Crea un lienzo</strong> para empezar.
          </p>
          <p>• Usa el ID de un lienzo existente para reabrirlo.</p>
          <p>• Los cambios se guardan automáticamente.</p>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value='ai'>
        <AccordionTrigger>AI Tools</AccordionTrigger>
        <AccordionContent className='space-y-2'>
          <p>
            <strong>AI Generate:</strong> Escribe un prompt como "cuadrado azul" y se
            dibuja automáticamente.
          </p>
          <p>
            <strong>Refine:</strong> Mejora las formas actuales, ajustando
            tamaño y proporciones.
          </p>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value='about'>
        <AccordionTrigger>Acerca de mí</AccordionTrigger>
        <AccordionContent className='space-y-2 text-sm'>
          <p>
            Hola 👋 soy <span className='font-medium'>Alexander Duque</span>,
            desarrollador de software Fullstack.
          </p>
          <p>
            Me la he pasado muy bien haciendo esta prueba 🚀 y me encantaría
            tener la oportunidad de trabajar con{' '}
            <span className='font-medium'>Vidext </span>
            como desarrollador <strong>Next.js / React</strong>.
          </p>
          <p>
            Y por qué no… ¡también aportar un poco de <strong>IA</strong> 🤖 al
            equipo!
          </p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
