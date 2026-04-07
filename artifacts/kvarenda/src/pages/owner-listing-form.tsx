import { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Plus, X, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useGetListing, useCreateListing, useUpdateListing } from "@workspace/api-client-react";
import { useRole } from "@/lib/role-context";
import { useToast } from "@/hooks/use-toast";
import { useI18n, useT } from "@/lib/i18n";

const DISTRICTS = ["Yunusobod", "Mirzo Ulugbek", "Chilonzor", "Shaykhontohur", "Yakkasaroy", "Uchtepa", "Olmazor", "Sergeli"];
const AMENITIES = ["WiFi", "Air conditioning", "Washing machine", "Parking", "Elevator", "Security", "Balcony", "Furniture", "Kitchen appliances", "TV"];

const formSchema = z.object({
  title: z.string().min(5),
  description: z.string().optional(),
  address: z.string().min(1),
  district: z.string().min(1),
  priceUzs: z.string().min(1),
  rooms: z.string().min(1),
  area: z.string().optional(),
  floor: z.string().optional(),
  totalFloors: z.string().optional(),
  deposit: z.string().optional(),
  amenities: z.array(z.string()).optional(),
  rules: z.string().optional(),
  photos: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function OwnerListingForm() {
  const { id } = useParams<{ id?: string }>();
  const isEditing = !!id && id !== "new";
  const [, setLocation] = useLocation();
  const { userId, role } = useRole();
  const { toast } = useToast();
  const { t, lang } = useI18n();
  const { tr } = useT();

  const { data: existing } = useGetListing(Number(id), {
    query: { enabled: isEditing, queryKey: ["getListing", Number(id), "edit"] }
  });

  const createListing = useCreateListing();
  const updateListing = useUpdateListing();
  const [photoInput, setPhotoInput] = useState("");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      address: "",
      district: "",
      priceUzs: "",
      rooms: "1",
      area: "",
      floor: "",
      totalFloors: "",
      deposit: "",
      amenities: [],
      rules: "",
      photos: [],
    },
  });

  useEffect(() => {
    if (existing && isEditing) {
      form.reset({
        title: existing.title,
        description: existing.description ?? "",
        address: existing.address,
        district: existing.district,
        priceUzs: String(existing.priceUzs),
        rooms: String(existing.rooms),
        area: existing.area ? String(existing.area) : "",
        floor: existing.floor ? String(existing.floor) : "",
        totalFloors: existing.totalFloors ? String(existing.totalFloors) : "",
        deposit: existing.deposit ? String(existing.deposit) : "",
        amenities: existing.amenities ?? [],
        rules: existing.rules ?? "",
        photos: existing.photos ?? [],
      });
    }
  }, [existing, isEditing]);

  const onSubmit = async (values: FormValues) => {
    const payload = {
      ownerId: userId,
      title: values.title,
      description: values.description,
      address: values.address,
      district: values.district,
      priceUzs: parseInt(values.priceUzs),
      rooms: parseInt(values.rooms),
      area: values.area ? parseFloat(values.area) : undefined,
      floor: values.floor ? parseInt(values.floor) : undefined,
      totalFloors: values.totalFloors ? parseInt(values.totalFloors) : undefined,
      deposit: values.deposit ? parseInt(values.deposit) : undefined,
      plan: "basic" as const,
      amenities: values.amenities,
      rules: values.rules,
      photos: (values.photos ?? []).filter(Boolean),
      published: true,
      status: "active" as const,
    };

    try {
      if (isEditing) {
        await updateListing.mutateAsync({ id: Number(id), data: payload });
        toast({ title: tr(t.ownerForm.updated) });
      } else {
        await createListing.mutateAsync({ data: payload });
        toast({ title: tr(t.ownerForm.created) });
      }
      setLocation("/owner");
    } catch (e) {
      toast({ title: tr(t.common.error), description: tr(t.ownerForm.saveError), variant: "destructive" });
    }
  };

  if (role !== "owner") {
    return (
      <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">
        {tr(t.ownerForm.switchOwner)}
      </div>
    );
  }

  const selectedAmenities = form.watch("amenities") ?? [];
  const photos = form.watch("photos") ?? [];

  const addPhoto = () => {
    const url = photoInput.trim();
    if (!url) return;
    form.setValue("photos", [...photos, url]);
    setPhotoInput("");
  };

  const removePhoto = (index: number) => {
    form.setValue("photos", photos.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Link href="/owner">
          <Button variant="ghost" size="sm" className="mb-6 gap-2 text-muted-foreground">
            <ArrowLeft className="w-4 h-4" />
            {tr(t.ownerForm.backToDashboard)}
          </Button>
        </Link>

        <div className="bg-card border border-border rounded-2xl p-6">
          <h1 className="text-xl font-bold mb-6">{isEditing ? tr(t.ownerForm.editTitle) : tr(t.ownerForm.addTitle)}</h1>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{tr(t.ownerForm.listingTitle)}</FormLabel>
                    <FormControl>
                      <Input placeholder={tr(t.ownerForm.titlePlaceholder)} {...field} data-testid="input-title" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <p className="text-sm font-medium mb-3">{tr(t.ownerForm.photos)}</p>
                {photos.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {photos.map((url, i) => (
                      <div key={i} className="relative group rounded-lg overflow-hidden border border-border aspect-video bg-muted">
                        <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = ""; (e.target as HTMLImageElement).alt = "Invalid URL"; }} />
                        <button
                          type="button"
                          onClick={() => removePhoto(i)}
                          className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <Input
                    placeholder={tr(t.ownerForm.photoUrlPlaceholder)}
                    value={photoInput}
                    onChange={(e) => setPhotoInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addPhoto(); } }}
                    data-testid="input-photo-url"
                  />
                  <Button type="button" variant="outline" size="sm" onClick={addPhoto} className="flex-shrink-0 gap-1" data-testid="button-add-photo">
                    <Plus className="w-4 h-4" />
                    {tr(t.ownerForm.addPhoto)}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{tr(t.ownerForm.photoHint)}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="district"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{tr(t.ownerForm.district)}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-district">
                            <SelectValue placeholder={tr(t.ownerForm.selectDistrict)} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {DISTRICTS.map(d => (
                            <SelectItem key={d} value={d}>{d}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{tr(t.ownerForm.address)}</FormLabel>
                      <FormControl>
                        <Input placeholder={tr(t.ownerForm.addressPlaceholder)} {...field} data-testid="input-address" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="priceUzs"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{tr(t.ownerForm.monthlyPrice)}</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder={tr(t.ownerForm.pricePlaceholder)} {...field} data-testid="input-price" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="rooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{tr(t.ownerForm.rooms)}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-rooms">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">1</SelectItem>
                          <SelectItem value="2">2</SelectItem>
                          <SelectItem value="3">3</SelectItem>
                          <SelectItem value="4">4</SelectItem>
                          <SelectItem value="5">5+</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="area"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{tr(t.ownerForm.area)}</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder={tr(t.ownerForm.areaPlaceholder)} {...field} data-testid="input-area" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="floor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{tr(t.ownerForm.floor)}</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="3" {...field} data-testid="input-floor" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="totalFloors"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{tr(t.ownerForm.totalFloors)}</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="9" {...field} data-testid="input-total-floors" />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="deposit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{tr(t.ownerForm.deposit)}</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder={tr(t.ownerForm.depositPlaceholder)} {...field} data-testid="input-deposit" />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{tr(t.ownerForm.description)}</FormLabel>
                    <FormControl>
                      <Textarea rows={4} placeholder={tr(t.ownerForm.descPlaceholder)} {...field} data-testid="textarea-description" />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div>
                <p className="text-sm font-medium mb-3">{tr(t.ownerForm.amenities)}</p>
                <div className="grid grid-cols-2 gap-2">
                  {AMENITIES.map(amenity => {
                    const label = (t.amenityLabels as Record<string, Record<string, string>>)[amenity];
                    const displayName = label ? (label[lang] || label.en || amenity) : amenity;
                    return (
                      <div key={amenity} className="flex items-center gap-2">
                        <Checkbox
                          id={`amenity-${amenity}`}
                          checked={selectedAmenities.includes(amenity)}
                          onCheckedChange={(checked) => {
                            const curr = form.getValues("amenities") ?? [];
                            form.setValue(
                              "amenities",
                              checked ? [...curr, amenity] : curr.filter(a => a !== amenity)
                            );
                          }}
                          data-testid={`checkbox-amenity-${amenity}`}
                        />
                        <label htmlFor={`amenity-${amenity}`} className="text-sm cursor-pointer">{displayName}</label>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-3">{tr(t.ownerForm.houseRules)}</p>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {[
                    { key: "children", label: { en: "Children allowed", ru: "Можно с детьми", uz: "Bolalar bilan mumkin" } },
                    { key: "pets", label: { en: "Pets allowed", ru: "Можно с животными", uz: "Hayvonlar bilan mumkin" } },
                    { key: "smoking", label: { en: "Smoking allowed", ru: "Можно курить", uz: "Chekish mumkin" } },
                    { key: "parties", label: { en: "Parties allowed", ru: "Вечеринки разрешены", uz: "Ziyofatlar mumkin" } },
                  ].map(rule => (
                    <div key={rule.key} className="flex items-center gap-2">
                      <Checkbox
                        id={`rule-${rule.key}`}
                        checked={(form.watch("rules") ?? "").includes(`${rule.key}:yes`)}
                        onCheckedChange={(checked) => {
                          const current = form.getValues("rules") ?? "";
                          const parts = current.split("|").filter(p => p && !p.startsWith(`${rule.key}:`));
                          if (checked) parts.push(`${rule.key}:yes`);
                          else parts.push(`${rule.key}:no`);
                          form.setValue("rules", parts.join("|"));
                        }}
                      />
                      <label htmlFor={`rule-${rule.key}`} className="text-sm cursor-pointer">{rule.label[lang] || rule.label.en}</label>
                    </div>
                  ))}
                </div>
              </div>

              <FormField
                control={form.control}
                name="rules"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{tr(t.ownerForm.additionalRules)}</FormLabel>
                    <FormControl>
                      <Textarea rows={3} placeholder={tr(t.ownerForm.rulesPlaceholder)} {...field} data-testid="textarea-rules" />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex gap-3 pt-2">
                <Link href="/owner">
                  <Button type="button" variant="outline" className="flex-1">{tr(t.ownerForm.cancel)}</Button>
                </Link>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={createListing.isPending || updateListing.isPending}
                  data-testid="button-save-listing"
                >
                  {createListing.isPending || updateListing.isPending ? tr(t.ownerForm.saving) : isEditing ? tr(t.ownerForm.saveChanges) : tr(t.ownerForm.createListing)}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
