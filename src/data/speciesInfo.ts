// Detailed, display-ready information for each species (Japanese).
export interface SpeciesInfo {
  habitat: string;
  diet: string;
  description: string;
}

export const SPECIES_INFO: Record<string, SpeciesInfo> = {
  "t-hawk": { habitat: "山地の森林・崖", diet: "ノウサギ・ヘビ・小鳥", description: "森林生態系の頂点に立つ大型猛禽。翼を広げると1.5mを超え、上空から獲物を狙う。" },
  "t-fox": { habitat: "里山・草原・森林", diet: "ネズミ・果実・昆虫", description: "夜行性の雑食獣。鋭い聴覚で地中の獲物も探し当てる。" },
  "t-kingfisher": { habitat: "清流・湖沼のほとり", diet: "小魚・水生昆虫", description: "「渓流の宝石」と呼ばれる青い羽。水面にダイブして魚を捕らえる。" },
  "t-stagbeetle": { habitat: "雑木林・クヌギ林", diet: "樹液・果実", description: "立派な大あごを持つ人気の甲虫。夜間に樹液に集まる。" },
  "t-monarch": { habitat: "草原・花畑", diet: "花の蜜（成虫）", description: "鮮やかなオレンジの翅を持つ蝶。花の受粉を助ける重要なポリネーター。" },
  "t-bee": { habitat: "森林・里山", diet: "花の蜜・花粉", description: "日本在来のミツバチ。集団で花粉を運び、植物の繁殖を支える。" },
  "t-sakura": { habitat: "山地・丘陵", diet: "光合成（生産者）", description: "日本の山に自生する野生種の桜。春に淡紅色の花を咲かせる。" },
  "t-fern": { habitat: "林床・日陰の斜面", diet: "光合成（生産者）", description: "胞子で増えるシダ植物。森林の地表を覆い湿度を保つ。" },
  "t-bamboo": { habitat: "里山・竹林", diet: "光合成（生産者）", description: "成長が非常に速い大型のイネ科。繁殖力が強く管理が必要な場合も。" },
  "t-grass": { habitat: "草原・斜面・道端", diet: "光合成（生産者）", description: "秋に銀色の穂を立てるイネ科の草本。富士山麓の草原を彩る代表的な植物。" },
  "f-otter": { habitat: "河川・湖の水辺", diet: "魚・甲殻類・カエル", description: "清流の頂点捕食者。かつて各地にいたが激減し、保全の象徴とされる。" },
  "f-heron": { habitat: "河川・湖沼・水田", diet: "魚・カエル・昆虫", description: "水辺で静かに佇み、長いくちばしで一瞬にして獲物を突く大型の水鳥。" },
  "f-trout": { habitat: "冷たい清流・渓流", diet: "水生昆虫・小魚", description: "渓流に棲むサケ科の魚。きれいな水の指標種でもある。" },
  "f-crayfish": { habitat: "池・水路・水田", diet: "水草・小動物・有機物", description: "北米原産のザリガニ。繁殖力が高く在来種を脅かす外来種。" },
  "f-frog": { habitat: "水田・池・湿地", diet: "昆虫・クモ", description: "水辺に暮らすカエル。水質や環境変化に敏感な指標種。" },
  "f-daphnia": { habitat: "止水域・池", diet: "植物プランクトン", description: "「ミジンコ」として知られる微小な甲殻類。水の浄化と食物連鎖の基盤。" },
  "f-lotus": { habitat: "池・沼の浅水", diet: "光合成（生産者）", description: "水面に大きな葉と花を広げる水生植物。水中の生き物の隠れ家にもなる。" },
  "f-algae": { habitat: "止水・流れの緩い水域", diet: "光合成（生産者）", description: "糸状の緑藻。水中の酸素を生み出す一次生産者。" },
  "f-reed": { habitat: "湖岸・湿地・河川", diet: "光合成（生産者）", description: "水辺に茂る大型の草本。鳥や昆虫の隠れ家となり、湿地を支える。" },
  "f-duckweed": { habitat: "池・ため池の水面", diet: "光合成（生産者）", description: "水面を覆う小型の浮草。繁殖が速く、ミジンコなどの餌にもなる。" },
  "m-dolphin": { habitat: "沿岸・外洋", diet: "魚・イカ", description: "高い知能を持つ海の哺乳類。群れで行動し沿岸生態系の頂点に立つ。" },
  "m-gull": { habitat: "海岸・港・岩礁", diet: "魚・甲殻類・残餌", description: "「ミャー」と猫のように鳴く海鳥。沿岸の掃除屋でもある。" },
  "m-mackerel": { habitat: "沿岸の中層", diet: "動物プランクトン・小魚", description: "群れで泳ぐ身近な海水魚。多くの捕食者を支える重要な中間種。" },
  "m-crab": { habitat: "潮間帯の岩場", diet: "藻・小動物・有機物", description: "岩礁にすむ小型のカニ。分解者として磯の生態系を支える。" },
  "m-krill": { habitat: "外洋の中・表層", diet: "植物プランクトン", description: "海洋食物連鎖を支える小型甲殻類。クジラなど多くの動物の餌。" },
  "m-tuna": { habitat: "外洋の表層", diet: "小魚・イカ", description: "時速80kmで泳ぐ大型回遊魚。海洋食物連鎖の重要な捕食者。" },
  "m-seaweed": { habitat: "岩礁の浅海", diet: "光合成（生産者）", description: "大型の海藻（コンブ）。多くの海洋生物の住処と餌になる。" },
  "m-plankton": { habitat: "海洋表層", diet: "光合成（生産者）", description: "海の食物連鎖の出発点。地球の酸素の多くを生み出す微小な生産者。" },
  "m-amamo": { habitat: "浅い砂泥底", diet: "光合成（生産者）", description: "海草の一種。稚魚やカニの隠れ場所となり、磯の生態系を支える。" },
  "m-aoasa": { habitat: "岩礁・干潟", diet: "光合成（生産者）", description: "緑色の海藻。潮間帯で見られ、多くの小動物の餌となる。" },
};
