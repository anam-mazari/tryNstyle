export function HomeValueStrip() {
  const items = [
    {
      title: 'Free shipping',
      body: 'On every order, straight to your door.',
    },
    {
      title: 'Easy returns',
      body: '30 days to love your frames—or send them back.',
    },
    {
      title: 'Try them on',
      body: 'Use live try-on to see styles on your face before you buy.',
    },
  ];

  return (
    <section className="border-y border-neutral-200 bg-stone-50">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-12 sm:px-6 md:grid-cols-3 md:gap-8 lg:px-8">
        {items.map((item) => (
          <div key={item.title} className="text-center md:text-left">
            <h2 className="font-serif text-lg font-medium text-neutral-900">{item.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-neutral-600">{item.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
